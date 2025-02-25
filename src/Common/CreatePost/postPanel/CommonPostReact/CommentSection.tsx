import { ChangeEvent, FC, useState , useContext ,useRef} from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import MainComment from "./MainComment";
import SubComment from "./SubComment";
import { LoadMoreReplies } from "@/utils/constant";
import { Input } from "reactstrap";
import { Href } from "@/utils/constant/index";
import Picker, {  EmojiClickData } from 'emoji-picker-react';
import { toast } from "react-toastify";
import { Spinner } from "reactstrap";
import {commentOnPostAPI,ApiResponse} from "@/Common/CreatePost/client_api/api";
import PostCommentsAndReplyToComment from "@/Common/CreatePost/postPanel/CommonPostReact/PostCommentsAndReplyToComment";
import {CommonPostReactContextInterface} from "@/Common/CreatePost/types/postPanel"
import {CommonPostReactContext} from "@/Common/CreatePost/context/post_context"
import { number } from "yup";
//type begin
interface CommentSectionInterFace {

}
//type end
const CommentSection: FC<CommentSectionInterFace> = (props) => {
  //context data begin
  const {post_id,showComment,handleSetShowComment} : CommonPostReactContextInterface = useContext(CommonPostReactContext);
  //context data begin
  //state begin
  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  //state end

  //ref begin
  const pstCmntsAndReplyToCmntRef = useRef<any>(null);
  //ref end
  
  //event handler begin
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };


  const addEmoji = (emoji:EmojiClickData,event:MouseEvent) => {
    event.stopPropagation();
    setMessageInput((prev)=>{
      return (prev ?? "" ) + emoji.emoji;
    })
  }

  const handleCommentOnPost = async (e:React.MouseEvent<HTMLAnchorElement>) =>{
    let apiStatus : boolean = true;
    let _message_input : string =  messageInput;
    if( !Boolean(_message_input.trim()) )
    {
      apiStatus =  false;
      toast.error("comment box can't be empty...");
    }
    if(apiStatus)
    {
      setIsSubmitting(true);
      try{
        let _data = { postId : post_id , comment : _message_input };
        let response : ApiResponse = await commentOnPostAPI(_data) as ApiResponse;
        if(response?.status ==  200)
        {
          toast.success("comment saved on post");
          handleSetShowComment && handleSetShowComment("Y","N");
          if(pstCmntsAndReplyToCmntRef.current)
          {
            pstCmntsAndReplyToCmntRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }

          if(showEmojiPicker)
          {
            setShowEmojiPicker(false);
          }
        }
      }
      catch(e:any){
        toast.error("unable to save comment on post");
      }
      finally{
        setMessageInput("");
        setIsSubmitting(false);
      }
    }
  }

  const handleSetMessage = (event: ChangeEvent<HTMLInputElement>) =>{
    setMessageInput(event.target.value);
  }
  //event handler end
  return (
    <div className="comment-section" ref = { pstCmntsAndReplyToCmntRef }>
      {
        showComment?.open && <PostCommentsAndReplyToComment />
      }
  
      <div className="reply">
        <div className="search-input input-style input-lg icon-right">
          <Input type="text" className="emojiPicker" placeholder="write a comment.." value={messageInput} onChange = { (event: ChangeEvent<HTMLInputElement>)=> { handleSetMessage(event) } }  />
          <div className="action_div"> 
            {
              showEmojiPicker && 
              <Picker skinTonesDisabled = {true} onEmojiClick={addEmoji}/>
            }
            <a href={Href} className = {`emoji_comment ${isSubmitting ? 'pointer_events_none' : ''}`}>
              <DynamicFeatherIcon iconName="Smile" className="icon icon-2 iw-16 ih-16" onClick={toggleEmojiPicker}/>
            </a>
          
            <a href={Href} className = {`comment_message ${isSubmitting ? 'pointer_events_none' : ''}`} onClick = { (e:React.MouseEvent<HTMLAnchorElement>) => { handleCommentOnPost(e) } }>
              {
                isSubmitting 
                ?
                <Spinner className="d-inline-block" size = 'sm'></Spinner>
                :
                <DynamicFeatherIcon iconName="Send" className="iw-16 ih-16 icon"/>
              }
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
