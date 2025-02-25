import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
interface Data {
  activityRecords? : any[]
};

interface ReqData {

}

export async function POST(request : Request)
{
  let apiStatus : boolean = true;
  let data : Data = {};
  let successMessage : string = "Response Ok";
  let errorMessage : string = "Response Not Ok";
  let usersRecords : any[] = [];
  let current_time_stamp : string = getCurrentTimeStamp();
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let reqData : ReqData = await request.json();
    let q_param : any[]= [];
    const sql : string = `
      SELECT 
        yut_2.user_id,
        (
          SELECT
            COUNT(id) AS chat_count
          FROM
            user_chats uc_1
          WHERE uc_1.to_user_id = ${login_user_id}
            AND uc_1.from_user_id = yut_2.user_id
            AND uc_1.removed = 'N'
            AND uc_1.seen_by_to_user IS NULL
        ) AS unseen_chat_count,
        ( 
          SELECT 
            JSON_OBJECT( 
              'last_seen',
              DATE_FORMAT(ulh_1.logout_time,"%e %b %y %l:%i %p"),
              'days_since_last_login',
              ABS(DATEDIFF('${current_time_stamp}',ulh_1.logout_time)),
              'seconds_since_last_login',
              ABS(TIMESTAMPDIFF(SECOND,ulh_1.logout_time,'${current_time_stamp}'))
            ) 
          FROM user_login_histories ulh_1 WHERE ulh_1.user_id =  yut_2.user_id 
          ORDER BY ulh_1.id DESC 
          LIMIT 1
        ) AS last_seen_object
        FROM 
        yearbook_user_trans yut_2
        INNER JOIN users 
        ON yut_2.user_id =  users.id
        AND users.status = 1
        AND users.is_verified = 1
        WHERE
        yut_2.removed = 'N'
        AND yut_2.user_id <> ${login_user_id}
        AND yut_2.yearbook_id IN (
          SELECT yut_1.yearbook_id FROM yearbook_user_trans yut_1 WHERE yut_1.user_id = ${login_user_id} AND yut_1.removed = 'N'
        )
        GROUP BY 
          yut_2.user_id
        ORDER BY 
          yut_2.user_id
    `;

    let q_result : any = await excuteQuery(sql,q_param);
    if(q_result.q_res)
    {
      data.activityRecords = q_result.q_res;
    }
    else{
      throw new Error("Query Error");
    }
  }
  catch(error:any){
    apiStatus = false;
  }
  finally{

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
  else
  {
    return NextResponse.json(
      {
        'message': errorMessage,
        'data' : data,
        'error' : ''
      },
      {
        'status':400,
        'statusText':"Response Not Ok"
      }
    );
  }
}