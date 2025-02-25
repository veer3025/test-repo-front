// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  usersData?:any[];
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
        ptt.id,
        p1.id as post_id,
        ptt.user_id,
        CONCAT_WS(' ',u1.first_name,u1.last_name) AS user_full_name,
        u1.profile_photo AS user_profile_photo,
        u1.email as email
      FROM 
        posts p1
      INNER JOIN post_tag_trans ptt
        ON ptt.post_id = p1.id
        AND ptt.removed = 'N'
      INNER JOIN users u1
        ON u1.id = ptt.user_id
      WHERE
        p1.id = ?
      ORDER BY
       user_full_name ASC
    `;

    const q_param : any = [postId];
    const q_result : any = await excuteQuery(qry,q_param);
    if(q_result?.q_res)
    {
      data.usersData = q_result?.q_res ?? [];
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
