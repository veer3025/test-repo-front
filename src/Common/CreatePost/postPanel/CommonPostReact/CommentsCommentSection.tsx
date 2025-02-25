import { ChangeEvent, FC, useState , useContext ,useRef} from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Input } from "reactstrap";
import { Href } from "@/utils/constant/index";
import Picker, {  EmojiClickData } from 'emoji-picker-react';
import { Spinner } from "reactstrap";
import { toast } from "react-toastify";
import {PostCommentsAndReplyToCommentContext} from "@/Common/CreatePost/context/post_context"
import {PostCmntsNdReplyToCmntInterface,selectedCommentType} from '@/Common/CreatePost/types/postPanel'
//type begin
interface CommentsCommentSectionInterFace {
  defaultSelectedComment:selectedCommentType
}

//type end
const CommentsCommentSection: FC<CommentsCommentSectionInterFace> = (props) => {
  //props begin
  const {defaultSelectedComment} = props;
  //props end

  //context begin
  const {selectedComment = defaultSelectedComment,setSelectedComment =  undefined , handleSetSelectedCommentId = undefined } : PostCmntsNdReplyToCmntInterface = useContext(PostCommentsAndReplyToCommentContext);
  //context end

  //props begin
  const {} = props;
  //props end
  
  //state begin
  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  //state end
  
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

  const handleSubmitSubComment = async (message:string) =>{
    try{
      setIsSubmitting(true);
      setTimeout(()=>{

      },3000);
      console.log(selectedComment);
      console.log(message);
      console.log("submit");
    }
    catch(error:any){

    }
    finally{
      setIsSubmitting(false);
    }
  }

  const handleSubmitComment = () =>{
    if(!Boolean(messageInput))
    {
      toast.error("comment box can't be empty...");
    }
    else{
      handleSubmitSubComment && handleSubmitSubComment(messageInput);
    }
  }
  //event handler end
  return (
    <div className="sub-comment-section">
      <div className="reply">
        <div className="search-input input-style input-lg icon-right">
          <Input type="text" className="emojiPicker" placeholder="write a comment.." value={messageInput} onChange={(event: ChangeEvent<HTMLInputElement>)=>setMessageInput(event.target.value)}/>
          <div className="action_div"> 
            {
              showEmojiPicker && 
              <Picker skinTonesDisabled = {true} onEmojiClick={addEmoji}/>
            }
            <a href={Href} className = {`emoji_comment ${isSubmitting ? 'pointer_events_none' : ''}`}>
              <DynamicFeatherIcon iconName="Smile" className="icon icon-2 iw-16 ih-16" onClick={toggleEmojiPicker}/>
            </a>
          
            <a href={Href} className = {`comment_message ${isSubmitting ? 'pointer_events_none' : ''}`}>
              {
                isSubmitting 
                ?
                <Spinner className="d-inline-block" size = 'sm'></Spinner>
                :
                <DynamicFeatherIcon iconName="Send" className="iw-16 ih-16 icon" onClick = {handleSubmitComment} />
              }
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsCommentSection;
