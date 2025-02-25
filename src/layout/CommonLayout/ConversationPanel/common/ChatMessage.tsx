// MTak Begin
import { FC , useState } from "react";
import Image from "next/image";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import ViewImageModal from '@/layout/CommonLayout/ConversationPanel/common/viewImageModal'
// import { v4 as uuidv4 } from 'uuid';
interface ChatMessageInterFace {
  data: any,
  loginUserInfo: any,
  selectedUserData : any,
  handleDownloadFile : ( event:React.MouseEvent<HTMLButtonElement,MouseEvent>,file_system_name: string ,file_original_name:string) => void;
}
const defaultUserImagePath = '/assets/default/user.png';
const userChatsFilesPath = '/images/user_chats';
const defaultFileLogoPath = '/assets/default/file_logo_chat.png';
const ChatMessage: FC<ChatMessageInterFace> = (props) => {
  //props begin
  const {loginUserInfo,data,selectedUserData,handleDownloadFile} = props;
  //props end
  //state begin
  const [viewImageModal, setViewImageModal] = useState<boolean>(false);
  //state end

  //constants
  const chat_src : string = `${userChatsFilesPath}/${data.file_system_name}`;
  return(
    <>
      {
        Boolean(loginUserInfo) &&
        <div data-id = {data.id} className = {`d-flex gap-3 ${loginUserInfo.id != data?.from_user_id ? 'chat_message' : ''}`}>
          {
            (loginUserInfo.id != data?.from_user_id) &&
            <img height={50} width={50} className="user-img user_image" src={ `${Boolean(selectedUserData.profile_photo) ? `${selectedUserData.profile_photo}` : `${defaultUserImagePath}` }` }  alt="user" />
          }
          <div key={data.id} className={`msg ${ loginUserInfo.id == data?.from_user_id ? 'msg-rightt' : 'msg-leftt'}`}>
            {
              data.chat_type == 'F' ?
              <>
                {
                  data.file_system_name && 
                  <div className = "image_div" title = {data.file_original_name}>
                    {
                      data.file_type == "IMG" 
                      ?
                        <img height={400} width={400} className="chat_img" src={`${chat_src}`} alt="user" />
                      :
                        <img height={400} width={400} className="chat_img" src={`${defaultFileLogoPath}`} alt="user" />
                    }
                  </div>
                }
                <div className = "top_right_action">
                  {
                    (data.file_type == "IMG") &&
                    <button title="view" className = "no_style_button view_image" onClick = { (e) => { setViewImageModal(true) } } >
                      <DynamicFeatherIcon iconName="Eye" className=""/>
                    </button>
                  }
                  <button title="download" className = "no_style_button download_file" onClick = { (e) => {handleDownloadFile(e,data.file_system_name,data.file_original_name)} } >
                    <DynamicFeatherIcon iconName="Download" className="" />
                  </button>
                </div>
              </>
              :
              <span>{data.message}</span>                
            }
            {
              (loginUserInfo.id != data?.from_user_id && data?.is_seen == 'N' ) &&
              <span className = "new_span">new</span>
            }
            <div className = "send_date">
              {data.send_text}
            </div>
          </div>
          {
            (loginUserInfo.id == data?.from_user_id) &&
            <img height={50} width={50} className="user-img user_image" src={ `${Boolean(loginUserInfo.profile_photo) ? `${loginUserInfo.profile_photo}` : `${defaultUserImagePath}` }` } alt="user" />
          }
        </div>
      }

      {
        viewImageModal &&
        <ViewImageModal key = {`data.id_${viewImageModal}`} modal = {viewImageModal} setModal = {setViewImageModal} image_src={`${chat_src}`} />
      }
    </>
  );
}

export default ChatMessage;