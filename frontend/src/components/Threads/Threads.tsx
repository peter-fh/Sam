import { useEffect, useState } from "react"
import { useThreadSelectionContext } from "../../context/useThreadContext"
import { DB } from "../../database/db"
import './Threads.css'
import { useChatSettings } from "../../context/useChatContext"


interface ConversationItem {
	title: string,
	id: number,
}


function Threads() {
	const {
		setThreadsOpen,
		setCurrentThread,
	} = useThreadSelectionContext()

	const {
		sidebar,
	} = useChatSettings()

	const [conversations, setConversations] = useState<ConversationItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [_, setEmptyConversations] = useState<boolean>(false)

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
		<div className="thread" onClick={handleClick}>
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
					<div className="threads-list">
					<i>
						Loading Conversations...
						</i>
					</div>
				</>
			)
		}

		return (
			<>
				<div className="threads-list">
					<ul>
						{conversations.map((conversation) => (
							<ClickableThread key={conversation.id} id={conversation.id} title={conversation.title}/>
						))}
					</ul>
				</div>
			</>
		)
	}

	return (
		<>
			<div className="threads" style={{
				marginLeft: sidebar ? '15em' : 0
			}}>
				<div className="title-items">
					<button className="threads-button interactive" onClick={() => {
						setThreadsOpen(false)
						setCurrentThread(null)
					}} 
					>
						New Chat 
					</button>
				</div>
				<hr className="separator"/>
				<ConversationList/>
			</div>
		</>
	)
}

export default Threads
