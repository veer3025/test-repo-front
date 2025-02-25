// MTak Begin
import { FC ,useContext , useEffect, useState} from "react";
import {  Input } from "reactstrap";
import Picker, { EmojiClickData } from 'emoji-picker-react';
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {CreatePostContextInterface,postObjInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
export interface CreateBgPostInterFace {
  colorList : any[];
  postObjInitial :postObjInterface;
  showEmojiPicker : boolean;
  setShowEmojiPicker : React.Dispatch<React.SetStateAction<boolean>>;
}
const CreateBgPost: FC<CreateBgPostInterFace> = (props) => {
  //props begin
  const {colorList,postObjInitial,showEmojiPicker,setShowEmojiPicker} = props;
  //props end

  //context begin
  const { postObj = postObjInitial , setPostObj = undefined , isPostSubmitting = false ,handleSetWritePost = undefined} : CreatePostContextInterface = useContext(CreatePostContext);
  //context end

  //Event Handler Begin
  const addPostMessageEmoji = (emoji:EmojiClickData,event:MouseEvent) => {
    event.stopPropagation();
    if(setPostObj)
    {
      setPostObj((prev)=>{
        let _message : string = (prev.postMessage ?? "") + emoji.emoji;
        return {...prev ,'postMessage': _message};
      });
     // setShowEmojiPicker(false);
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

  const handleClose = () =>{
    setShowEmojiPicker(false);
    handleSetWritePost && handleSetWritePost(false,"");
  }

  //Event Handler End
  return (
    <div className="create-bg my-2 mt-3">
      <div className={`bg-post ${postObj.postClass} ${postObj.writePost ? "d-block" : ""} `} style = {{ margin: '1rem 0px'}}>
        <div className="input-sec">
          <Input 
            value = {postObj.postMessage}
            onChange = { (e:React.ChangeEvent<HTMLInputElement>)=> { handlePostMessageChange(e)  }}     
            type="text" 
            placeholder="write something here.." 
          />

          <button className = "close-icon text-dark no_style_button" onClick={() => { handleClose() }}>
            X
          </button>

          <div className="emojiDiv">
            <button disabled = { isPostSubmitting } className = {`no_style_button emoji_picker_button  ${showEmojiPicker ? 'active' : ''}`} style={{color: 'rgb(128, 128, 128)'}} onClick={(e:React.MouseEvent<HTMLButtonElement>)=>{ handleSetShowEmojiPicker(e) } } >
              <DynamicFeatherIcon iconName="Smile" className="" />
            </button>  
            <div onClick={ (e:React.MouseEvent<HTMLDivElement>) => { e.stopPropagation() }}>
              { (showEmojiPicker) && <Picker skinTonesDisabled = {true} onEmojiClick={addPostMessageEmoji}/> }
            </div>
          </div>

        </div>
      </div>
      <ul className="gradient-bg theme-scrollbar m-0">
        {
          colorList.map((data, index) => (
            <li key={index} onClick={() => handleSetWritePost && handleSetWritePost(true,`gr-${data}`)} className={`gr-${data}`} style={{ pointerEvents : `${isPostSubmitting ? 'none' : 'unset'}` }}>
            </li>
          ))
        }
      </ul>
    </div>
  );
};

export default CreateBgPost;
