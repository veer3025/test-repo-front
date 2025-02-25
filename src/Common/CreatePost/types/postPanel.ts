// Mtak begin
import React from "react";

export interface PostPanelContextInterface {
  posts?:any[];
  defaultUserImagePath?: string;
  postsFileBasePath?: string;
  reactions ?: any[];
  setPosts ?: React.Dispatch<React.SetStateAction<any[]>>;
  setPostPanelReset?:React.Dispatch<React.SetStateAction<number>>;
}

export interface viewImageModalDataInterface {
  open:boolean;
  image:string;
}

export interface showCommentInterface {
  open:boolean;
  comments:any[];
}

export interface CommonPostReactContextInterface {
  post_id ?: number;
  showComment ?: showCommentInterface;
  setShowComment ?: React.Dispatch<React.SetStateAction<showCommentInterface>>;
  isCommentLoading?:boolean;
  handleSetShowComment?:(load_comment?:string,loadMore?:string)=>void
}

export interface PostComponentContextInterface {
  commonLikePanelLikesDataReload?: number;
  setCommonLikePanelLikesDataReload?:React.Dispatch<React.SetStateAction<number>>;
  commonLikePanelCommentsDataReload?:number;
  setCommonLikePanelCommentsDataReload?: React.Dispatch<React.SetStateAction<number>>;
}

export type selectedCommentType = { id:number , type : 'SUB' | 'MAIN' | ''}
export interface PostCmntsNdReplyToCmntInterface {
  selectedComment?: selectedCommentType,
  setSelectedComment?: React.Dispatch<React.SetStateAction<selectedCommentType>>,
  handleSetSelectedCommentId?: (e:React.MouseEvent<HTMLAnchorElement>,selectedComment : selectedCommentType ) => void,
}