// MTak Begin
import { createContext } from "react";
import {CreatePostContextInterface} from '@/Common/CreatePost/types/postTypes'
import {PostPanelContextInterface,CommonPostReactContextInterface,PostComponentContextInterface,PostCmntsNdReplyToCmntInterface} from '@/Common/CreatePost/types/postPanel'
export const CreatePostContext = createContext<CreatePostContextInterface>({});
export const CreatePostPostPanelContext = createContext<PostPanelContextInterface>({});
export const CommonPostReactContext = createContext<CommonPostReactContextInterface>({});
export const PostComponentContext = createContext<PostComponentContextInterface>({});
export const PostCommentsAndReplyToCommentContext =  createContext<PostCmntsNdReplyToCmntInterface>({});
