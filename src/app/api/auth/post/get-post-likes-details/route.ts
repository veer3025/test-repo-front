// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  likesData?:any[];
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
        COUNT(DISTINCT plt.user_id) AS total_likes,
        ( SELECT 
            plt_2.reaction_code 
          FROM 
            post_like_trans plt_2 
          WHERE 
            plt_2.user_id = ${login_user_id} 
              AND plt_2.removed = "N" 
              AND plt.post_id = plt_2.post_id LIMIT 1 
        ) AS reaction_code_by_logged_in_user
        FROM 
          post_like_trans plt
        INNER JOIN 
          posts p1 ON p1.id = plt.post_id
          AND p1.removed = 'N'
        WHERE 
          plt.post_id = ${postId}
          AND plt.removed = 'N'
        GROUP BY 
          plt.post_id
    `;

    const q_param : any = [login_user_id];
    const q_result : any = await excuteQuery(qry,q_param);
   // console.log(q_result);
    if(q_result?.q_res)
    {
      data.likesData = q_result?.q_res[0] ?? [];
    }
    else{
      throw new Error("QRY Error");
    }
  }
  catch(error)
  {
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
