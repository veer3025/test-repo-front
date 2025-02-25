// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import { format } from 'date-fns'
type Data = {
  users?:any[];
};
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let response_user_activity : {status:boolean} = await updateUserActivity(login_user_id);
    //console.log(response_user_activity);
    const qry :string = `
      SELECT 
        yut_2.id,
        yut_2.user_id,
        yut_2.yearbook_id,
        yb_1.name AS yearbook_name,
        CONCAT_WS(' ',users.first_name,users.last_name) AS full_name,
        users.profile_photo,
        users.email,
        countries.name as country_name,
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
              ABS(DATEDIFF(NOW(),ulh_1.logout_time)),
              'seconds_since_last_login',
	            ABS(TIMESTAMPDIFF(SECOND,ulh_1.logout_time,NOW()))
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
      LEFT JOIN yearbooks yb_1
	      ON yb_1.id = yut_2.yearbook_id
      LEFT JOIN 
        countries ON countries.id = users.country_id
      WHERE
        yut_2.removed = 'N'
        AND yut_2.user_id <> ${login_user_id}
        AND yut_2.yearbook_id IN (
          SELECT yut_1.yearbook_id FROM yearbook_user_trans yut_1 WHERE yut_1.user_id = ${login_user_id} AND yut_1.removed = 'N'
        )
      GROUP BY 
        yut_2.user_id
      ORDER BY 
        full_name ASC
    `;
    
    const q_param : any = [];
    const q_result : any = await excuteQuery(qry,q_param);
    if(q_result?.q_res)
    {
      data.users = q_result?.q_res ?? [];
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

const updateUserActivity = async (login_user_id:number) : Promise<any> =>{
  let response : {status?:boolean} = { status : false};
  try{
    let created = getCurrentTimeStamp();
    const sql = `
      INSERT INTO user_login_histories(user_id,login_time,logout_time,created,modified)
      VALUES(${login_user_id},'${created}','${created}','${created}','${created}')
    `;
    const q_param : any[]= [];
    let qry_response = await excuteQuery(sql,q_param);
    if(qry_response.q_res)
    {
      response.status = true;
    }
  }
  catch(error:any)
  {

  }
  return response;
}
const getCurrentTimeStamp = () : string => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}