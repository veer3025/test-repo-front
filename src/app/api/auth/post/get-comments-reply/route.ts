// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  comments?:any[];
};

type ReqData = {
  commentId?:number;
  l_comment_id?: number;
}

export const POST = async (request : Request) =>{ 
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  const current_time_stamp : any = getCurrentTimeStamp();
  const limit : number = 5;
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data =  await request.json();
    const {l_comment_id = 0 ,commentId} : ReqData = req_data;
   // console.log(commentId);
    //console.log(l_comment_id);
    
    const qry :string = `
      SELECT 
        temp.*, 
        (
          CASE 
            WHEN created_dte_secnds_diff < 60 THEN 
              CONCAT(ROUND(created_dte_secnds_diff)," second ago")
            WHEN created_dte_secnds_diff < 60 * 60 THEN
              CONCAT(ROUND(created_dte_secnds_diff / 60)," minute ago")
            WHEN created_dte_secnds_diff < 60 * 60 * 24 THEN
              CONCAT(ROUND(created_dte_secnds_diff / (60 * 60)) ," hour ago")
            ELSE 
              created_date
          END
        ) AS created_text
      FROM
      (
        SELECT 
        pcrt.id,
        pcrt.post_id,
        pcrt.post_comment_tran_id,
        pcrt.post_comment_reply_tran_id,
        CONCAT_WS(" ",u1.first_name,u1.last_name) AS cmnt_by_usr_name,
        u1.profile_photo AS cmnt_by_pfp,
        u1.email,
        pcrt.reply,
        countries.name AS country_name,
        DATE_FORMAT(pcrt.created,"%e %b %y %l:%i %p") AS created_date,
        ABS(TIMESTAMPDIFF(SECOND,pcrt.created,'${current_time_stamp}')) AS created_dte_secnds_diff,
        (
          SELECT 
            JSON_OBJECT( 'id',u2.id, 'full_name',CONCAT_WS(" ",u2.first_name,u2.last_name),'email',u2.email) 
          FROM post_comment_reply_trans pcrt_2 
          INNER JOIN users u2 
            ON u2.id = pcrt_2.user_id 
          WHERE 
            pcrt_2.id = pcrt.post_comment_reply_tran_id 
            AND pcrt_2.removed = 'N' LIMIT 1
        ) AS reply_to_user_obj
        FROM post_comment_reply_trans pcrt
        LEFT JOIN users u1
        ON u1.id = pcrt.user_id
        AND u1.status = 1
        AND u1.is_verified = 1    
        LEFT JOIN 
          countries ON countries.id = u1.country_id     
        WHERE pcrt.post_comment_tran_id = ${commentId}
        AND pcrt.removed = 'N'
      ) temp
      ORDER BY temp.id ASC
    `;

    const q_param : any = [login_user_id];
    const q_result : any = await excuteQuery(qry,q_param);
    // console.log(q_result);
    if(q_result?.q_res)
    {
      data.comments = q_result?.q_res ?? [];
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
