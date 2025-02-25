// MTak Begin
import { useState ,FC} from "react";
import axios from "axios";
import CreatePostHeader from "./CreatePostHeader";
import { Button ,Spinner } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
// import OptionsInputs from "./OptionsInputs";
import TagFriends from "@/Common/CreatePost/TagFriends";
import PrivateUsers from "@/Common/CreatePost/PrivateUsers";
import AlbumDropzone from "@/Common/CreatePost/AlbumDropzone";
import { toast } from "react-toastify";
import {CreatePostContextInterface,albumObjInterface,postObjInterface,tagFriendsInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
import {ApiResponse,commonAPIPath} from "@/Common/CreatePost/client_api/api";
import CreateBgPost from "@/Common/CreatePost/createBgPost";
import '@/Common/CreatePost/css/create_post.css'
// import { createPostData } from "@/Data/common";
interface CreatePostInterface {
  setPostPanelReset: React.Dispatch<React.SetStateAction<number>>
}
//constant begin
const maxFileSize :number = 2;//mb 
const maxFiles :number = 10;
//constant end
const albumInitial : albumObjInterface = {active:false,images:[],progress:0};
const postObjInitial : postObjInterface = { postMessage : '',postClass : '' ,writePost:false , postType:"PUBLIC" ,privateUserIds : []};
const tagFriendsInitial : tagFriendsInterface = { active : false , userIds : [] };
const CreatePost : React.FC<CreatePostInterface> = (props) => {
  //props begin
  const {setPostPanelReset } = props;
  //props end
  //state begin
  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState<boolean>(false);
  const [showMessageEmojiPicker, setShowMessageEmojiPicker] = useState<boolean>(false);
  const [isLoading,setLoading] = useState<boolean>(false);
  const [isSubmitting,setIsSubmitting] =  useState<boolean>(false);
  const colorList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const [postObj,setPostObj] = useState<postObjInterface>(postObjInitial);
  const [tagFriendsObj , setTagFriendsObj] = useState<tagFriendsInterface>(tagFriendsInitial);
  const [albumObj,setAlbumObj] = useState<albumObjInterface>(albumInitial);
  //state end

  //event handler begin
  const handleClearAll = ()=>{
    setPostObj(postObjInitial);
    setTagFriendsObj(tagFriendsInitial);
    setAlbumObj(albumInitial);
    setShowMessageEmojiPicker(false);
    setShowPostEmojiPicker(false);
  }
  const createPostAPI = async (_data:any) : Promise<unknown>=>{
    let response: ApiResponse = {};
    let url : string | undefined = `${commonAPIPath}/post/create-post`;
    try{
      let _response = await axios.post(url,_data,{
        onUploadProgress : (e:any)=>{
          if (e.total)
          {
            const progressPercentage = Math.round((e.loaded * 100) / e.total);
            setAlbumObj((prev)=>{
              return {...prev,progress:progressPercentage};
            });
          }
        }
      });
      response = { status : _response?.status , ..._response?.data };
    }
    catch(error:any){
      throw error;
    }
    return response;
  }

  const handleSetWritePost = (b_val:boolean,value : string) =>{
    if(b_val)
    {
      handleSetAlbumActive(false);
    }
    setShowMessageEmojiPicker(false);
    setPostObj((prev)=>{
      let new_obj = {...postObjInitial , 'postMessage' : prev.postMessage, 'writePost' : b_val };
      if(b_val)
      {
        new_obj = {...new_obj , 'postClass' : value };
      }
      return new_obj;
    });
  }

  const handleSetTagFriendsActive = (e:React.MouseEvent<HTMLLIElement>) =>{    
    setTagFriendsObj((prev)=>{
      return {...tagFriendsInitial,active:!prev.active};
    });
  }

  const handleSetAlbumActive = ( b_val : boolean) =>{ 
    setAlbumObj((prev)=>{
      return { ...albumInitial , 'active' : b_val };
    });
  }

  const handleRemoveParticularAlbumImages = (event:React.MouseEvent<HTMLButtonElement>,index:number) => {
    event.stopPropagation();
    setAlbumObj((prev)=>{
      let _prevAlbumImages : File[] = prev.images ?? [];
      let filteredAlbumImages =  _prevAlbumImages.filter((record:any,_index:number)=>{
        return index != _index;
      });
      return {...prev,images:filteredAlbumImages};
    });
  }

  const handleSubmitPost = async (event:React.MouseEvent<HTMLButtonElement>) =>{
    let formStatus : boolean =  true;
    let formdata = new FormData;
    let _message : string =  postObj.postMessage;
    let _post_class : string = postObj.writePost ? postObj.postClass : '';
    let _postType : string = postObj.postType; 

    if( !Boolean(_message?.trim()) && !albumObj?.active  )
    {
      toast.error(`write something to create post`);
      formStatus = false;
    }
    else if ( postObj?.postType == "PRIVATE" && !Boolean(postObj?.privateUserIds.length) ) 
    {
      toast.error(`share with atleast one user`);
      formStatus = false;
    }
    else if( tagFriendsObj?.active && !Boolean(tagFriendsObj?.userIds?.length) )
    {
      toast.error(`tag atleast one user`);
      formStatus = false;
    }
    else if( albumObj?.active && !Boolean(albumObj?.images?.length) )
    {
      toast.error(`upload atleast one image`);
      formStatus = false;
    }
    
    if(formStatus)
    {
      if(albumObj?.active)
      { 
        if(albumObj?.images.length)
        {
          albumObj?.images.map((file:File,index:number)=>{
            formdata.append('imagesArr',file);
          });
        }
      } 

      if(tagFriendsObj?.active)
      {
        let _userIds : any[] =  tagFriendsObj?.userIds ?? []; 
        _userIds.map((id:any,index:number)=>{
          formdata.append('userIds',id);
        });
      }
      
      if( postObj?.postType == "PRIVATE" )
      {
        let _privateUserIds : any[] = postObj?.privateUserIds ?? [];
        _privateUserIds.map((id:any,index:number)=>{
          formdata.append('privateUserIds',id);
        });
      }

      formdata.append('message',_message);
      formdata.append('post_class',_post_class);
      formdata.append('post_type',_postType);
      //Api Call Begin
      try{
        setIsSubmitting(true);
        let response : ApiResponse = await createPostAPI(formdata) as ApiResponse;
        if(response?.status == 200)
        {
          toast.success(`Post Created Successfully`);
          setPostPanelReset && setPostPanelReset((prev)=>{ return prev + 1; });
        }
      }
      catch(error:any)
      {
        toast.error(`Unable to create Post`);
      }
      finally{
        setIsSubmitting(false);
        handleClearAll();
      }
      //Api Call End
    }
  }

  const dashboardCreatePostClickCapture = (e: any) =>{
    showPostEmojiPicker && setShowPostEmojiPicker(false);
    showMessageEmojiPicker && setShowMessageEmojiPicker(false);
  }
  //event handler end

  const contextData : CreatePostContextInterface = {
    'maxFileSize' : maxFileSize,
    'maxFiles' : maxFiles,
    'handleRemoveParticularAlbumImages':handleRemoveParticularAlbumImages,
    'isPostSubmitting':isSubmitting,
    'handleSetWritePost':handleSetWritePost,
    'albumObj' :albumObj,
    'setAlbumObj':setAlbumObj,
    'postObj' :postObj,
    'setPostObj':setPostObj,
    'tagFriendsObj':tagFriendsObj,
    'setTagFriendsObj':setTagFriendsObj,
    'isCreatePostLoading' : isLoading,
    'setCreatePostLoading':setLoading
  }

  return (
    <CreatePostContext.Provider value = {contextData}>
      <div id="DashboardCreatePostDivId" className="create-post" onClick={ (e:any) => { dashboardCreatePostClickCapture(e) } }>
        <CreatePostHeader showEmojiPicker = {showMessageEmojiPicker}  setShowEmojiPicker = {setShowMessageEmojiPicker} postObjInitial = {postObjInitial} />
        <CreateBgPost showEmojiPicker = {showPostEmojiPicker} setShowEmojiPicker = {setShowPostEmojiPicker} postObjInitial = {postObjInitial} colorList = {colorList}/>
        <ul className="create-btm-option my-2">
          {
            !postObj.writePost &&
            <li onClick={ ()=> { handleSetAlbumActive(!albumObj.active) } } style={{ pointerEvents : `${ isSubmitting ? 'none' : 'unset'}` }}>
              <h5 className={ albumObj.active ? 'text-primary' : ''}>
                <DynamicFeatherIcon iconName="Camera" className="iw-14" />Album
              </h5>
            </li>
          }

          <li onClick={ (e:React.MouseEvent<HTMLLIElement>)=> { handleSetTagFriendsActive(e) } } style={{ pointerEvents : `${ (isSubmitting) ? 'none' : 'unset'}` }}>
            <h5 className={ tagFriendsObj.active ? 'text-primary' : ''}>
              <DynamicFeatherIcon iconName={"Tag"} className={ "iw-15" }/>
              {"tag friends"}
            </h5>
          </li>
          
        </ul>
          
        {
          (postObj?.postType == "PRIVATE") &&
          <div className="my-2">
            <PrivateUsers key = {`PUsr${postObj?.postType}`} />
          </div>
        }

        {
          tagFriendsObj.active &&
          <div className="my-2">
            <TagFriends postObjInitial = {postObjInitial} key = {`TF${tagFriendsObj.active}`} 
            />
          </div>
        }

        {
          albumObj.active &&
          <div className="my-2 album_dropzone">
            <AlbumDropzone albumInitial = {albumInitial} />
          </div>
        }

        <div className={`post-btn d-block`}>
          <Button disabled = {isSubmitting } className="m-0" onClick = { (e:React.MouseEvent<HTMLButtonElement>) => { handleSubmitPost(e)} }>
            {isSubmitting ? 'Posting...' :'Post'}
            {isSubmitting && <Spinner className="ms-1" size = 'sm'>Loading...</Spinner>}
          </Button>
        </div>

        { 
          ( isLoading || isSubmitting ) &&
          <div className="loader">
            <Spinner className="ms-1" color = "primary" ></Spinner>
          </div>
        }
      </div>
    </CreatePostContext.Provider>
  );
};
export default CreatePost;
