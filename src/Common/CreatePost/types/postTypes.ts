// MTak Begin
export type postTypeInterface = "PUBLIC"|"PRIVATE";
export interface albumObjInterface {
  active:boolean;
  images:File[];
  progress:number;
};

export interface postObjInterface  { 
  postMessage : string;
  postClass : string;
  writePost:boolean; 
  postType:postTypeInterface;
  privateUserIds:number[];
};
export interface tagFriendsInterface {
  active : boolean;
  userIds : number[];
}
export interface CreatePostContextInterface {
  maxFileSize? : number;
  maxFiles? : number;
  handleRemoveParticularAlbumImages?: (e:React.MouseEvent<HTMLButtonElement>,index:number) => void; 
  isPostSubmitting?:boolean;
  handleSetWritePost?:(b_val:boolean,value : string)=>void;
  albumObj?:albumObjInterface,
  setAlbumObj?: React.Dispatch<React.SetStateAction<albumObjInterface>>;
  postObj ?:postObjInterface,
  setPostObj?:React.Dispatch<React.SetStateAction<postObjInterface>>;
  tagFriendsObj?:tagFriendsInterface,
  setTagFriendsObj?:React.Dispatch<React.SetStateAction<tagFriendsInterface>>;
  isCreatePostLoading ?: boolean,
  setCreatePostLoading ?:React.Dispatch<React.SetStateAction<boolean>>;
  setPostPanelReset?:React.Dispatch<React.SetStateAction<number>>;
}
