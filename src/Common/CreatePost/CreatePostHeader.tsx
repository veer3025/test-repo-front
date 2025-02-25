// MTak Begin
import React, { FC ,useContext } from "react";
import {  Input } from "reactstrap";
import OptionDropDown from "./OptionDropDown";
import Picker, { EmojiClickData } from 'emoji-picker-react';
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {CreatePostContextInterface,postObjInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
export interface CreatePostHeaderInterFace {
  postObjInitial :postObjInterface;
  showEmojiPicker : boolean;
  setShowEmojiPicker : React.Dispatch<React.SetStateAction<boolean>>;
}
const CreatePostHeader: FC<CreatePostHeaderInterFace> = (props) => {
  //props begin
  const {postObjInitial,showEmojiPicker,setShowEmojiPicker} = props;
  //props end
  
  //context begin
  const { postObj = postObjInitial ,setPostObj = undefined, isPostSubmitting = false} : CreatePostContextInterface = useContext(CreatePostContext);
  //context end  
  //Event Handler Begin
  const addPostMessageEmoji = (emoji:EmojiClickData , event:MouseEvent) => {
    event.stopPropagation();
    if(setPostObj)
    {
      setPostObj((prev)=>{
        let _message : string = (prev.postMessage ?? "") + emoji.emoji;
        return {...prev ,'postMessage': _message};
      });
      //setShowEmojiPicker(false);
    }
  }

  const handlePostMessageChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
    let value : string =  e.target.value;
    if(setPostObj)
    {
      setPostObj((prev)=>{
        return {...prev ,'postMessage': value};
      });
    }
  }

  const handleSetShowEmojiPicker = (e:React.MouseEvent<HTMLButtonElement>) =>{
    e.stopPropagation();
    setShowEmojiPicker(!showEmojiPicker)
  }
  //Event Handler End

  return (
    <div className={`static-section`}>
      <div className="card-title">
        <h3>Create Post</h3>
        <ul className="create-option">
          <li className="options">
            <OptionDropDown postObjInitial = {postObjInitial}/>            
          </li>
        </ul>
      </div>
      <div className="search-input input-style icon-right messageTextAreaDiv">
        <Input
          value = {postObj.postMessage}
          onChange = { (e:React.ChangeEvent<HTMLInputElement>)=> { handlePostMessageChange(e)  }}
          type="textarea"
          className={`enable messageTextArea ${postObj.writePost ?"d-none":""}`}
          placeholder="write something here.."
        />
        
        <div className="emojiDiv">
          <button disabled = { isPostSubmitting } className = {`no_style_button emoji_picker_button ${showEmojiPicker ? 'active' : ''}`} onClick={(e:React.MouseEvent<HTMLButtonElement>)=>{ handleSetShowEmojiPicker(e) } } >
            <DynamicFeatherIcon iconName="Smile" className="" />
          </button>
          <div onClick={ (e:React.MouseEvent<HTMLDivElement>) => { e.stopPropagation() }}>
            { (showEmojiPicker) && <Picker skinTonesDisabled = {true} onEmojiClick ={addPostMessageEmoji}/> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostHeader;
