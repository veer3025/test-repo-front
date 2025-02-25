// MTak Begin
// import { useSession } from 'next-auth/react'
import { useState, useEffect ,useRef} from 'react';
import { Href } from "@/utils/constant/index";
import { FC } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Input } from "reactstrap";
import '@/layout/CommonLayout/ConversationPanel/css/chat.css'
// import Image from "next/image";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
// import { Button } from 'reactstrap';
import ChatMessage from '@/layout/CommonLayout/ConversationPanel/common/ChatMessage'
import ChatFilePreivew from '@/layout/CommonLayout/ConversationPanel/common/ChatFilePreivew'
import Picker, { EmojiClickData } from 'emoji-picker-react';
//My Imports
import { getChatsByUserIdAPI,getIncomingChatsAPI,downloadChatFileAPI,readIncomingChatsAPI,ApiResponse,commonAPIPath} from "@/layout/client_api/chat_box_common/api";

//My Custim Interfaces Begin
interface ChatBoxCommonInterFace {
  setChatBox: (value: boolean) => void;
  selectedUserData : any;
  setSelectedUserData : (value: any) => void;
  loginDiffSeconds:number;
}

type fileType = 'IMG' | 'OTH' | 'NONE';
type ChatType = 'F' | 'T'
interface chatMessageObjectInterface {
  message? : string;
  chat_type? : ChatType;
  file_type? : fileType;
  files? : any;
}
//My Custim Interfaces End

//constants begin
const incomingChatInterval : number = 1500;
const imageMimesTypeArr : string[] = [
  "image/png",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/tiff"
];
const allowedFilesText : string = "allowed files : image, pdf, doc, ppt, excel";
const maxFileSize : number = 5;
const maxFileSizeBytes : number = maxFileSize*1024*1024;
const pdfMimesTypeArr : string[]  = ["application/pdf"];
const excelMimesTypeArr : string[] = ["application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
const docMimesTypeArr : string[] = ["application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const pptMimesTypeArr : string[] = ["application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"];
const textMimesTypeArr : string[] = [];//["text/plain"];
const defaultUserImagePath : string = '/assets/default/user.png';
const allowedMimesTypeArr : string[]  = [
  ...imageMimesTypeArr,
  ...pdfMimesTypeArr,
  ...excelMimesTypeArr,
  ...pptMimesTypeArr,
  ...textMimesTypeArr,
  ...docMimesTypeArr
];

const chatMessageObjectReset : chatMessageObjectInterface = {
  message : "",
  file_type:"NONE",
  chat_type : 'T',
  files : [],
}
//constants end
const ChatBoxCommon: FC<ChatBoxCommonInterFace> = (props) => {
  // const { data: session } = useSession();
  //props Begin
  const { setChatBox ,selectedUserData ,setSelectedUserData ,loginDiffSeconds } = props;
  //console.log(selectedUserData?.last_seen_object);
  //props End
  //states Begin
  const [isInitialChatLoaded,setIsInitialChatLoaded] = useState(false);
  const [showOption, setShowOption] = useState<boolean>(false);
  const [smallChat, setSmallChat] = useState<boolean>(false);
  const [isSubmitting,setIsSubmitting] = useState<boolean>(false);
  const [chats, setChats] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [loginUserInfo,setloginUserInfo] = useState<any>();
  const [bActive,setBActive] =  useState<boolean>(false);
  const chatsTrack =  useRef<any>();
  const chatBodyRef =  useRef<any>();
  const textBoxRef =  useRef<any>();
  const isSeenModeRef =  useRef<boolean>(false);
  const [chatMessageObject,setChatMessageObject] = useState<chatMessageObjectInterface>(chatMessageObjectReset);
  const tracedVisibleIdsRef = useRef<any[]>([]);
  const [chatFileUploadProgress,setChatFileUploadProgress] = useState<number>(0);
  //states End
  //prop dependant constants Begin
  const chat_with_user_id : number = selectedUserData.user_id;
  //prop dependant constants End

  //console.log(selectedUserData);
  //Event Handler Begin
  const handleChatBoxInputChange = (event: React.ChangeEvent<HTMLInputElement>,_chat_type:any = 'T',_file_type:any="NONE") => {
    //setNewMessage(event.target.value);
    // console.log(_file_type);
    let value =  event.target.value;
    let _files : any = [];
    let fileStatus = true;
    if(_chat_type == 'F')
    {
      value = "";
      let e_files : any = event.target.files;
      for(let file of e_files)
      {
        // let fileName : string = file.name;
        let fileSize : number = file.size;
        let mime_type : string = file.type;
        // console.log(mime_type);
        if( _file_type ==  "IMG" && !mime_type.toLowerCase().includes("image/") )
        {
          fileStatus = false;
          toast.error(`not an image file`);
          return;
        }
        else if(fileSize > maxFileSizeBytes)
        {
          fileStatus = false;
          toast.error(`file size must be less than ${maxFileSize} mb`);
          return;
        }
        else if( !Boolean(allowedMimesTypeArr.includes(mime_type.toLocaleLowerCase())) )
        {
          fileStatus = false;
          toast.error(`${allowedFilesText}`);
          return;
        }
        _files.push({'fid':uuidv4(),'file':file});
      }
    }

    if(fileStatus)
    {
      let _chatMessageObject : chatMessageObjectInterface = {
        message : value,
        chat_type : _chat_type,
        file_type : _file_type,
        files : _files
      };

      setChatMessageObject((prev)=>{
        return {...prev,..._chatMessageObject};
      });

      if(_chat_type == 'F')
      {
        setBActive(()=>{
          return true;
        });
      }
    }
    else{
      setChatMessageObject((prev)=>{
        return {...chatMessageObjectReset , message : prev?.message ?? ""};
      });
    }
  };

  const sendChatMessageAPI = async(_formData : any) : Promise<unknown> =>{
    let response : unknown = null;
    let url : string | undefined = `${commonAPIPath}/common_chat/send_chat_message`;
    try{
      let response_temp = await axios.post(url, _formData, {
        onUploadProgress: (event: any) => {
          if (event.total) {
            const progressPercentage = Math.round((event.loaded * 100) / event.total);
            setChatFileUploadProgress(()=>{
              return progressPercentage;
            });
          }
        },
      });
      response = { status : response_temp.status , ...response_temp?.data};
    }
    catch(error:any){
      throw error;
    } 
    finally{
      setChatFileUploadProgress(()=>{
        return 0;
      });
    }
    return response;
  }

  const handleSendMessage = async (event:React.MouseEvent<HTMLButtonElement,MouseEvent> | null)  =>{
    let formStatus : boolean =  true;
    let formData : any = new FormData();
    let _files = chatMessageObject?.files ?? [];
    let message = chatMessageObject?.message?.trim() ?? "";
    let chat_type = chatMessageObject?.chat_type ?? "T";
    let file_type = chatMessageObject?.file_type ?? "NONE";
    let success_message  : string = "message sent";
    if(chat_type == 'F')
    {
      success_message = file_type == 'IMG' ? 'image sent' : 'file sent';
    }
    if(!Boolean(message) && chat_type == 'T')
    {
      toast.error("write message...");
      formStatus = false;
    }
    else if(formStatus)
    { 
      try{
        setIsSubmitting(true);
        setShowOption(false);
        setShowEmojiPicker(false);
        formData.append('to_user_id',chat_with_user_id);
        formData.append('message',message);
        formData.append('chat_type',chat_type);
        formData.append('file_type',file_type);
        _files.map((fileObj : any,index : any)=>{
          formData.append('files[]',fileObj.file);
        });

        //send start
        let response : ApiResponse = await sendChatMessageAPI(formData) as ApiResponse;
        //send end
        if(response?.status == 200)
        {
          toast.success(success_message);
          let chat_record = response?.data?.chat_record ?? {};
          setChats((prev)=>{
            return [...prev,chat_record];
          });
          setBActive(()=>{
            return true;
          });
          //console.log(chat_record);
        }
        else{
          throw new Error("Error Occur");
        }
      }
      catch(error)
      {
        toast.error("unable to send message...");
      }
      finally{
        setChatMessageObject(chatMessageObjectReset);
        setIsSubmitting(false);
      }
    }
  }

  const handleRemoveFile = () => {
    setChatMessageObject((prev)=>{
      return {...chatMessageObjectReset};
    });
  }

  const chatBodyScrollToBottom = () =>{
    if(chatBodyRef.current)
    {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight; 
    }
  }

  const addEmoji = (emoji:EmojiClickData) => {
    setChatMessageObject((prev)=>{
      let _message : string = (prev?.message ?? "") + emoji.emoji;
      return {...prev,message : _message};
    });
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) =>{
    if(event.key == "Enter" && !isSubmitting)
    {
      handleSendMessage(null);
    }
  }

  const handleDownloadFile = async (event:React.MouseEvent<HTMLButtonElement,MouseEvent>,file_system_name:string , file_original_name : string) =>{
    try{
      toast.success(`downloading...`);
      let body = {'file_system_name' :file_system_name ,'file_original_name' : file_original_name};
      let response : ApiResponse = await downloadChatFileAPI(JSON.stringify(body)) as ApiResponse;
      //console.log(response);
    }
    catch(error)
    {
      toast.error(`unable to download`);
    }
  }

  const handleIntersection = async (entries:any) => {
    let visibleListIds : any = [];
    let filteredIds : any = [];
    let tracedVisibleIdsArr = tracedVisibleIdsRef.current ?? [];
    try{
      visibleListIds = entries
        .filter( (entry : any)=> entry.isIntersecting)
        .map( (entry:any) => parseInt(entry.target.getAttribute('data-id')));
      //
      filteredIds = visibleListIds.filter((value:any,index:any)=>{
        return !tracedVisibleIdsArr.includes(value);
      });

      if(filteredIds?.length)
      {
        let formData =  new FormData();
        formData.append('chatIds',visibleListIds);
        let response : ApiResponse = await readIncomingChatsAPI(formData) as ApiResponse;
        if(response?.status == 200)
        {
          let distinctIDs : any[] = Array.from(new Set([...tracedVisibleIdsArr,...filteredIds]));
          tracedVisibleIdsRef.current = distinctIDs;
          isSeenModeRef.current = true;
          setChats((prev)=>{
            return prev.map((record:any,index:any)=>{
              return (filteredIds.includes(record.id) ? {...record, 'is_seen' : 'Y'} : record);
            });
          });
        }
      }
    }
    catch(error){
    }
    finally{

    }
  };

  const handleChatBodyScroll = ( e: React.UIEvent<HTMLDivElement, UIEvent>) =>{
    if(chatBodyRef.current && chatBodyRef.current.scrollTop == 0)
    {
      
    }
  }
  //Event Handler End
  
  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean = true;
    const loadData = async () => {
      let tempWithUserChats : any[] = [];
      let _chats : any[] = [];
      let _login_user : any = {}; 
      setIsInitialChatLoaded(false);
      try{
        let body : object = { 'chat_with_user_id' : chat_with_user_id };
        let response = await getChatsByUserIdAPI(JSON.stringify(body)) as ApiResponse;
        if(response.status ==  200)
        {
          _login_user = response.data?.login_user ?? [];
          _chats = response.data?.chats ?? [];
          tempWithUserChats = _chats.filter((record:any,index:number)=>{
            return record.from_user_id == chat_with_user_id;
          });
          if(tempWithUserChats.length)
          {
            chatsTrack.current = {id :tempWithUserChats[tempWithUserChats.length - 1].id};
          }
          else{
            chatsTrack.current = {id : 0};
          }
        }
      }
      catch(error)
      {
      }
      finally{
        setloginUserInfo(()=>{
          return _login_user;
        });
        setChats(()=>{
          return _chats;
        });
        setIsInitialChatLoaded(()=>{
          return true;
        });
        setBActive(()=>{
          return true;
        });
      }
    }
    
    if(isMounted)
    {
      loadData(); 
    }
    return ()=>{
      isMounted = false;
    }
  },[]);

  useEffect(()=>{
    let isMounted = true;
    let intervalId : any =  null;
    if(isMounted && isInitialChatLoaded)
    {
      intervalId = setInterval(async() =>{
        try{
          let chat_id : number = chatsTrack?.current?.id ?? 0;
          let body = { 'chat_id' : chat_id , 'chat_with_user_id' : chat_with_user_id}
          let response : ApiResponse = await getIncomingChatsAPI(JSON.stringify(body)) as ApiResponse;
          let chatsArr : any[] =  response?.data?.chats ?? [];
          if(response?.status == 200)
          { 
            // console.log(chatsTrack.current);
            // console.log(chatsArr);
            if(chatsArr?.length)
            { 
              if(chatsTrack.current.id != chatsArr[0].id)
              {
                chatsTrack.current = {id :chatsArr[chatsArr.length - 1].id};
                setChats((prev)=>{
                  return [...prev,...chatsArr];
                });
                // setBActive(()=>{
                //   return true;
                // });
              }
            }
          }
        }
        catch(error)
        { 
          //console.log(error) 
        }
      },incomingChatInterval);
    }
    return ()=>{
      clearInterval(intervalId);
      isMounted = false;
    }
  },[isInitialChatLoaded == true]);

  useEffect(()=>{
    let isMounted =  true;
    if(isMounted && bActive)
    {
      chatBodyScrollToBottom();
      setBActive(()=>{
        return false;
      });
    }
    return ()=>{
      isMounted = false;
    }
  },[bActive == true]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: chatBodyRef.current,
      threshold: 0.3,
    });
    const items = chatBodyRef.current.querySelectorAll('.chat_message');
    items.forEach( (item:any) => observer.observe(item));
    return () => {
      items.forEach( (item:any) => observer.unobserve(item));
    };
  },[chats]);
  
  //useEffect End
  return (
    <div id ="ChatBoxCommon" className="chat-box " style={{ right: 370 ,bottom:30}} >
      <a href={Href} className="chat-header">
        <div className="name"  title = {selectedUserData.full_name}>
          <div
            className="user-img"
            style={{backgroundImage: `url(${Boolean(selectedUserData.profile_photo) ? `${selectedUserData.profile_photo}` : `${defaultUserImagePath}`})` }}
          >
            <span className={`available-stats ${ selectedUserData?.last_seen_object?.seconds_since_last_login < loginDiffSeconds ? "online":"offline" }`} />
          </div>
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              lineHeight: '1.5'
            }}
          >
            <span style = {{width: '20ch'}}>{selectedUserData.full_name}</span>
            {
              Boolean(selectedUserData?.last_seen_object) &&
              <span style ={{ width : 'auto'}}>
                {
                  selectedUserData?.last_seen_object?.seconds_since_last_login < loginDiffSeconds
                  ?
                    <span className="text-success">online</span>
                  :
                  <>
                    {
                      selectedUserData?.last_seen_object?.days_since_last_login >= 1 && selectedUserData?.last_seen_object?.days_since_last_login <= 15
                      ?
                        <span>last seen { selectedUserData?.last_seen_object?.days_since_last_login } day ago</span>
                      :
                        <span>last seen { selectedUserData?.last_seen_object?.last_seen }</span>
                    }
                  </>
                }
              </span>
            }
          </div>
        </div>
        <div className="menu-option">
          <ul>
            <li onClick={() => setSmallChat(!smallChat)}>
              <div style= {{
                color:'#868686',
                fontSize:'2.5rem',
                lineHeight: '1',
              }}> { smallChat ? '+' : '-' } </div>
            </li>
            <li className="close-chat" onClick={() => setChatBox(false)}>
              <div style= {{
                color:'#868686',
                fontSize:'2.5rem',
                lineHeight: '1',
              }}> &#215; </div>
            </li>
          </ul>
        </div>
      </a>
      <div className={`chat-wrap ${smallChat ? "d-none" : ""}`}>
        <div className="chat-body" ref = {chatBodyRef} style = {{height: '22rem'}} onScroll = { (e: React.UIEvent<HTMLDivElement, UIEvent>) => { handleChatBodyScroll(e) } }>
          {
            chats.map((data:any, index:number) => (
              <ChatMessage selectedUserData = {selectedUserData} data = {data} loginUserInfo = { loginUserInfo } handleDownloadFile = {handleDownloadFile}/>
            ))
          }
          <div className="msg_push" />
          {
            Boolean(chatMessageObject?.files?.length) &&
            <ChatFilePreivew isSubmitting = {isSubmitting} chatFileUploadProgress = {chatFileUploadProgress} chatMessageObject = {chatMessageObject} handleRemoveFile = {handleRemoveFile} setBActive = {setBActive}/>
          }
        </div>
        <div className="chat-footer">
          { (showEmojiPicker) && <Picker skinTonesDisabled = {true} onEmojiClick={addEmoji}/> }
          <Input
            type="text"
            value={chatMessageObject?.message}
            onChange={ (e) => { handleChatBoxInputChange(e,"T","NONE")} }
            onKeyDown={ (e) => { handleInputKeyDown(e) } }
            disabled = {Boolean(chatMessageObject?.files?.length)}
            placeholder="type your message here.."
            className="chat_input chat-input form-control emojiPicker"
            ref = {textBoxRef}
          />  
          <div className = "d-flex gap-2">
            <button disabled = {isSubmitting} className = "no_style_button" onClick={ (e: React.MouseEvent<HTMLButtonElement>) => { handleSendMessage(e) } }>
              <DynamicFeatherIcon className = "text-primary" iconName="Send"/>
            </button>
            <button disabled={ Boolean(chatMessageObject?.files?.length) || isSubmitting } className = "no_style_button" style={{color: '#fe9811'}} onClick={()=>setShowEmojiPicker(!showEmojiPicker)}>
              <DynamicFeatherIcon iconName="Smile" className="" />
            </button>
            <div className={`add-extent  ${showOption ? "show" : ""}`}>
              {/* <span style={{cursor: 'pointer'}}> */}
              <button disabled={ isSubmitting } style = {{ marginTop: '0.4rem' }} className = "no_style_button" onClick={() => setShowOption(!showOption)}>
                <DynamicFeatherIcon iconName="PlusCircle" className="animated-btn text-info"/>
              </button>
              {/* </span> */}
              <div className="options">
                <input disabled = {isSubmitting} type = 'file' id="ChatBoxCommonImgField" style={{ display:'none' }} onChange={ (e) => { handleChatBoxInputChange(e,"F","IMG")} } />
                <input disabled = {isSubmitting} type = 'file' id="ChatBoxCommonOTHFileField" style={{ display:'none' }} onChange={ (e) => { handleChatBoxInputChange(e,"F","OTH")} } />
                <ul className = "option_ul">
                  <li className = "file_type_li" title = "upload image">
                    <label className ="_label" htmlFor = "ChatBoxCommonImgField">
                      <img src="../assets/svg/image.svg" />
                    </label>
                  </li>
                  <li className = "file_type_li" title = "upload other file">
                    <label className ="_label" htmlFor = "ChatBoxCommonOTHFileField">
                      <img src="../assets/svg/paperclip.svg"/>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatBoxCommon;
