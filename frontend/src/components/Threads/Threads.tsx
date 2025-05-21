import { useEffect, useState } from "react"
import { useThreadSelectionContext } from "../../context/useThreadContext"
import { DB } from "../../database/db"
import './Threads.css'
import { useChatSettings } from "../../context/useChatContext"
import { useNavigate } from "react-router-dom"


interface ConversationItem {
	title: string,
	id: number,
}


function Threads() {

	const navigate = useNavigate()

	const {
		setSelectedThread
	} = useThreadSelectionContext()

	const {
		sidebar,
	} = useChatSettings()

	const [conversations, setConversations] = useState<ConversationItem[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	interface ClickableThreadProps {
		id: number,
		title: string,
	}

	function ClickableThread(props: ClickableThreadProps) {
		const handleClick = () => {
			navigate(`/chat/${props.id}`)
			setSelectedThread(props.id)
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

		if (conversations.length == 0) {
			return (
				<>
					<div className="threads-list">
						<p>
							No previous chats. Click "New Chat" to start a conversation.
						</p>
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
						navigate("/")
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
