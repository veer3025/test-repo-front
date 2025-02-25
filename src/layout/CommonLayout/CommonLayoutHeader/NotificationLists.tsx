// Mtak Begin
// import { notificationList } from "@/Data/Layout";
// import { Href, ImagePath } from "../../../utils/constant/index";
// import axios from "axios";
import { Media } from "reactstrap";
// import Image from "next/image";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
// import { NotificationListsProps } from "@/layout/LayoutTypes";
import { FC } from "react";
//constant begin
const defaultUserImagePath : string = '/assets/default/user.png';
//constant end
//interface begin
interface NotificationListsPropsInterface {
  setShowNotification: any;
  notificData : any;
  handleMarkAsReadMessage : ( e:any,notiId :number ,isReadAll : boolean) => void;
}
//interface end

const NotificationLists: FC<NotificationListsPropsInterface> = (props) => {
  //props begin
  const {setShowNotification,notificData,handleMarkAsReadMessage} = props;
  // console.log(notificData);
  //props end
  return (
    <>
      {
        notificData &&
        <>
          {
            notificData.map((data:any, index:number) => (
              <li key={data.id} onClick={() => setShowNotification(false)}>
                <div className="left_div">
                  <Media>
                    {/* <Image src={ `${defaultUserImagePath}` } alt="user" width={40} height={40}/> */}
                    <img src={ `${Boolean(data.from_user_profile_photo) ? `${data.from_user_profile_photo	}` : `${defaultUserImagePath}` }` }  alt="user" width={40} height={40}/> 
                    <Media body>
                      <div>
                        <h5 className="mt-0">
                          <div className="fw-bold text-secondary">{data.from_user_name} : <span className="fw-bold">{data.title}</span></div>
                          <div title={data.message}>
                          {
                            data.message?.length > 80 
                            ? 
                              `${data.message.substring(0,80)}...`
                            : 
                              data.message 
                          } 
                          </div>
                        </h5>
                        <h6>{data.send_text}</h6>
                      </div>
                    </Media>
                  </Media>
                </div>
                <button className="no_style_button" title = "mark as read" onClick = { (e) => { handleMarkAsReadMessage(e,data.id,false) } }>
                  <DynamicFeatherIcon className = "text-primary" iconName="Eye"/>
                </button>
              </li>
            ))
          }
        </>
      }
    </>
  );
};

export default NotificationLists;