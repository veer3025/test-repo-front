// MTak Begin
import { UncontrolledPopover, PopoverBody, Media } from "reactstrap";
// import ButtonPopover from "@/layout/CommonLayout/ConversationPanel/HoverMessage/ButtonPopover";
import {  SvgPath } from "../../../../utils/constant";
// import Image from "next/image";
interface HoverMessagePropsCustom  {
  target: string;
  placement: "right"|"top";
  image:string;
  user_name:string;
  email : string;
  country_name : string;
}
const defaultUserImagePath = '/assets/default/user.png';
const HoverMessage = ( props: HoverMessagePropsCustom) => {
  //props begin
  const {target, placement , image, user_name , email , country_name} = props;
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
          <img height={60} width={60} className="img-fluid user-img" src={ image } alt="user" />
          <Media body>
            <h4 style = {{ wordBreak: 'break-all' }}>{user_name}</h4>
            <div className ="" style={{ display : 'flex' , flexDirection:'column' , gap:'0.2rem' , wordBreak: 'break-all'}}>
              <h6 className = "">{email}</h6>
              <h6 style = {{ fontSize:'0.8rem'}}>
                <img height={15} width={15} src={`${SvgPath}/map-pin.svg`} className="img-fluid" alt="users" />
                  lives in {country_name ? country_name : '--'}
              </h6>
            </div>
          </Media>
        </Media>
      </PopoverBody>
    </UncontrolledPopover>
  );
};

export default HoverMessage;
