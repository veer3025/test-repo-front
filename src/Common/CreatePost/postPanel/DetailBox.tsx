import { FC, useContext, useState ,Fragment} from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { ImagePath, PeopleReactThisPost } from "@/utils/constant";
import { toast } from 'react-toastify';
import { Button } from "reactstrap";
import {CreatePostPostPanelContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface} from '@/Common/CreatePost/types/postPanel'
import Galary from "@/Common/CreatePost/postPanel/Galary";
//type begin
interface DetailBoxProps {
  post : any
}

//type end
const DetailBox: FC<DetailBoxProps> = ({ post }) => {
  //context data begin
  const {postsFileBasePath = ""} : PostPanelContextInterface = useContext(CreatePostPostPanelContext);
  //context data end
 
  //sate begin
  const [readMore,setReadMore] = useState<boolean>(false);
  //state end
 
  //local data begin
  const images : any[] = post.images ?? [];
 // console.log(images);
  //local data end

  return (
    <div className="detail-box">
      
      {
        post.gr_class ?
        <div className={`${post.gr_class} gr_message`}>
          { ( post.message?.length > 800 && !readMore ) ? post.message.substring(0,800) : post.message } 
          {
            post.message?.length > 800 &&
            <Button color="link" className="px-0 read_more" style={{lineHeight : 0}} onClick = { () => setReadMore((prev)=>{ return !prev }) }>
              <span>{ readMore ? '...Read Less' : '...Read More'}</span>
            </Button>
          }
        </div>
        :
        <p className="m-0 p-0">
          { ( post.message?.length > 800 && !readMore ) ? post.message.substring(0,800) : post.message } 
          {
            post.message?.length > 800 &&
            <Button color="link" className="px-0 read_more" style={{lineHeight : 0}} onClick = { () => setReadMore((prev)=>{ return !prev }) }>
              <span>{ readMore ? '...Read Less' : '...Read More'}</span>
            </Button>
          }
        </p>
      }
      
      {
        !(images.length == 1 && images[0] == null) && ( images.length >= 1 ) && <Galary key = { `GLRY${post?.id}` } post_id = {post?.id} basePath = {postsFileBasePath} images = {images}/>
      }
    </div>
  );
};


export default DetailBox;
