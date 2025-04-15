import { useEffect, useState } from "react"
import { useThreadSelectionContext } from "../../context/useThreadContext"
import { DB } from "../../database/db"

interface ConversationItem {
	title: string,
	id: number,
}


function Threads() {
	const {
		setThreadsOpen,
		setCurrentThread,
	} = useThreadSelectionContext()

	const [conversations, setConversations] = useState<ConversationItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [emptyConversations, setEmptyConversations] = useState<boolean>(false)

	interface ClickableThreadProps {
		id: number,
		title: string,
	}

	function ClickableThread(props: ClickableThreadProps) {
		const handleClick = () => {
			setCurrentThread(props.id)
			setThreadsOpen(false)
		}
		return (
		<div onClick={handleClick}>
			<p>{props.title}</p>
		</div>
		)
	}

	async function updateConversations() {
		const conversation_data = await DB.getConversations()
		if (!conversation_data) {
			setLoading(false)
			setEmptyConversations(true)
			return
		}

		const total_conversations = []
		for (const conversation of conversation_data) {
			const convo: ConversationItem = {
				title: conversation.title!,
				id: conversation.id!,
			}
			total_conversations.push(convo)
		}
		setConversations(total_conversations)
		setLoading(false)
	}
	useEffect(() => {
		updateConversations()
	}, [])

	const ConversationList = () => {
		if (loading) {
			return (
				<>
					<div>
						Loading Conversations
					</div>
				</>
			)
		}

		return (
		<>
				<div>
					<h2>Items from Database</h2>
					<ul>
						{conversations.map((conversation) => (
							<ClickableThread id={conversation.id} title={conversation.title}/>
						))}
					</ul>
				</div>
		</>
		)
	}
	return (
		<>
			<button onClick={() => {
				setThreadsOpen(false)
				setCurrentThread(null)
			}} 
				className="interactive">
				New Conversation
			</button>
			<ConversationList/>
		</>
	)
}

export default Threads
