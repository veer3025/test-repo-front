// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  commentsData?:any[];
};

type ReqData = {
  postId?:number;
}

export const POST = async (request : Request) =>{ 
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data =  await request.json();
    const {postId} : ReqData = req_data;
    const qry :string = `    
      SELECT 
        COUNT(pct.id) AS total_comments_on_post
      FROM 
        post_comment_trans pct 
      INNER JOIN 
        posts p1 ON p1.id = pct.post_id
        AND p1.removed = 'N'
      WHERE 
        pct.post_id =  ${postId}
        AND pct.removed = "N";
    `;

    const q_param : any = [login_user_id];
    const q_result : any = await excuteQuery(qry,q_param);
    //console.log(q_result);
    if(q_result?.q_res)
    {
      data.commentsData = q_result?.q_res[0] ?? [];
    }
    else{
      throw new Error("QRY Error");
    }
  }
  catch(error)
  {
    // console.log(error);
    apiStatus = false;
  }
  if(apiStatus)
  {
    return NextResponse.json(
      {
        'message': successMessage,
        'data' : data,
        'error' : ''
      },
      {
        'status':200,
        'statusText':"Response Ok"
      }
    );
  }
  else{
    return NextResponse.json(
      {
        'message': errorMessage,
        'data' : {},
        'error' : ''
      },
      {
        'status':401,
        'statusText':"Error Occur"
      }
    );
  }
}
