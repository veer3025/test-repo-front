// MTak Begin
import { UncontrolledPopover, PopoverBody, Media } from "reactstrap";
// import ButtonPopover from "@/layout/CommonLayout/ConversationPanel/HoverMessage/ButtonPopover";
import {  SvgPath } from "../../../../utils/constant";
// import Image from "next/image";
interface HoverMessagePropsCustom  {
  target: string;
  placement: "right"|"top";
  data:any;
  loginDiffSeconds:number;
}
const defaultUserImagePath = '/assets/default/user.png';
const HoverMessage = ( props: HoverMessagePropsCustom) => {
  //props begin
  const {target, placement , data , loginDiffSeconds} = props;
  //props end
  const error = console.error;
  // console.log(target);
  console.error = (...args: any) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };
 // console.log(data);
  return (
    <UncontrolledPopover trigger="hover" placement={placement} target={target}>
      <PopoverBody>
        <Media className="popover-media">
          <img height={60} width={60} className="img-fluid user-img" src={ `${Boolean(data.profile_photo) ? `${data.profile_photo}` : `${defaultUserImagePath}` }` } alt="user" />
          <Media body>
            <h4 style = {{ wordBreak: 'break-all' }}>{data.full_name}</h4>
            <div className = "" style={{ display : 'flex' , flexDirection:'column' , gap:'0.2rem',wordBreak: 'break-all'}}>
              <h6 style = {{ fontSize:'0.8rem'}}>
                <img height={15} width={15} src={`${SvgPath}/map-pin.svg`} className="img-fluid" alt="users" />
                  lives in {data.country_name}
              </h6>
              <h6 className = "">{data?.yearbook_name}</h6>
              <h6 className = "text-nowrap" style = {{ width : 'auto' , fontSize:'0.8rem'}}>
                {
                  Boolean(data?.last_seen_object) &&
                  <span>
                    {
                      data?.last_seen_object?.seconds_since_last_login < loginDiffSeconds
                      ?
                        <span className = "text-success fw-bold">Online</span>
                      :
                      <>
                        {
                          data?.last_seen_object?.days_since_last_login >= 1 && data?.last_seen_object?.days_since_last_login <= 15
                          ?
                            <span>last seen { data?.last_seen_object?.days_since_last_login } day ago</span>
                          :
                            <span>last seen { data?.last_seen_object?.last_seen }</span>
                        }
                      </>
                    }
                  </span>
                }
              </h6>
            </div>
          </Media>
        </Media>
        {/* <ButtonPopover /> */}
      </PopoverBody>
    </UncontrolledPopover>
  );
};

export default HoverMessage;
