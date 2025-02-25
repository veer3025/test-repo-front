// MTak Begin
import React , {useContext} from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from "react-toastify";
import { Progress } from 'reactstrap'; 
import {CreatePostContextInterface,albumObjInterface} from '@/Common/CreatePost/types/postTypes'
import {CreatePostContext}  from '@/Common/CreatePost/context/post_context'
const AlbumDropzone: React.FC<{albumInitial:albumObjInterface}> = ({albumInitial}) => {
  //context begin
  const { albumObj = albumInitial , setAlbumObj = undefined , maxFileSize = 0 ,maxFiles = 0 , handleRemoveParticularAlbumImages , isPostSubmitting = false} : CreatePostContextInterface = useContext(CreatePostContext);
  //context end
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if(setAlbumObj)
      {
        // let _acceptedFiles : File[] = acceptedFiles ?? [];
        setAlbumObj((prev)=>{
          let prevAlbumImages = prev.images ?? [];
          let uplaoded_length : number = prevAlbumImages?.length ?? 0;
          let total_file : number = uplaoded_length + (acceptedFiles?.length ?? 0);
          
          if(maxFiles - uplaoded_length == 0){
            toast.error(`no more file can be uploaded`);
            return {...prev,'images':[...prevAlbumImages]};
          }
          else if(total_file > maxFiles)
          {
            toast.error(`only ${maxFiles - uplaoded_length} more file can be uploaded`);
            return {...prev,'images':[...prevAlbumImages]};
          }
          else
          {
            return {...prev,'images':[...prevAlbumImages,...acceptedFiles]};
          }
        });
      }
    },
    onDropRejected: (rejectedFiles) => {
      if(rejectedFiles?.length > 5)
      {
        toast.error(`you cant upload more than ${maxFiles} files`);
      }
      else{
        rejectedFiles.forEach(file => {
          if(file?.errors?.length)
          {
            file?.errors.map((record:any,index:number)=>{
              if(record?.code == 'file-too-large')
              {
                toast.error(`${file.file.name} : File size exceeded`);
              }
              else if(record?.code == 'file-invalid-type')
              {
                toast.error(`${file.file.name} : ${record?.message}`);
              }
            });
          }
        });
      }
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: (maxFileSize ?? 0) * 1024 * 1024,//MB
    maxFiles: maxFiles,
  });

  return (
    <>
      <div {...getRootProps()} className = "dropzone_div">
        <input {...getInputProps()} />
        <p className='drop_file_msg'>
          Drop files here...
        </p>
        <p className='file_desc'>
          (Allowed files: jpeg, png, gif)
        </p>
        <p className='file_desc'>
          (Max File Size : {maxFileSize} mb ,  Max Files : {maxFiles} )
        </p>
        {
          Boolean(albumObj.images?.length) &&
          <>
            <div className ="preview_container">
              {
                albumObj.images.map((record : File, index : any)=>(
                  <div key = {index} className = "preview_item" >
                    <img className = "imgg" src={ URL.createObjectURL(record) } alt={`preview-${index}`} />
                    <button disabled = { isPostSubmitting } className='no_style_button remove_file' onClick = { (e:React.MouseEvent<HTMLButtonElement>)=>{ handleRemoveParticularAlbumImages && handleRemoveParticularAlbumImages(e,index) } }>X</button>
                  </div>
                ))
              }
            </div>
            <Progress striped className="my-2" color="success" value={albumObj.progress ?? 0 }>{albumObj.progress ?? 0}%</Progress>
          </>
        }
      </div>
    </>
  );
};
export default AlbumDropzone;
