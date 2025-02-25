//M Tak Begin
import {getCurrentTimeStamp} from "@/libs/common_function"
import { v4 as uuidv4 } from 'uuid';
import excuteQuery from '@/app/api/connect_m'
//Ts Begin
type sendNotificationFunType = (login_user_id:number , notifType : notificationTypeType , data : any) => Promise<unknown>;
type notificationFormatType = {title: string ; message : string};
export type notificationTypeType = 'TR'|'TW'|'T'|'LP'|'C'|'LC'|'RR'|'LR'|'CN'|'CHT'|'P';
//Ts End
//available tags
/*
  ${to_user_full_name},
  ${from_user_full_name}
*/
export const sendNotification : sendNotificationFunType = async (login_user_id, notifType , data :any) => {
  let response : any = null;
  let userIdArr : number[] = [];
  let status : string = "P";
  try{
    // console.log(login_user_id);
    // console.log(notifType);
    let loggedInUserInfo : any = await getLoggedInUserInfo(login_user_id);
    let notification_format : notificationFormatType = await getNotificationFormat(notifType);
    let title : string = notification_format.title;
    let message : string = notification_format.message;
    if(notifType == "P")
    {
      if(data?.postType == 'PUBLIC')
      {
        userIdArr = await getUsersOfYearbooksWhereLoggedInUserBelongs(login_user_id);
      }
      else if(data?.postType == 'PRIVATE'){
        userIdArr = data?.userIds ?? [];
      }
    }
    else if(notifType == "C" || notifType == "LP" ){
      let post_id :number = data?.postId ?? 0;
      let commentByUserId = await getUsersIdWhoCommentedOnPost(post_id);
      if(commentByUserId != login_user_id)
      {
        userIdArr = [commentByUserId];
      }
    }

    if(userIdArr?.length)
    {
      let userRecords : any = await getUsersByUserIdArr(userIdArr);
      if(userRecords?.length)
      {
        let loggedInUserFullName : string = loggedInUserInfo?.full_name?.trim() ?? "";
        title = title.replace("${from_user_full_name}",loggedInUserFullName);
        message = message.replace("${from_user_full_name}",loggedInUserFullName);
        let response_2 : any = await storeNotification(login_user_id,userRecords,title,message,notifType,status) 
        response = response_2;
      }
    }
  }
  catch(error:any)
  {

  }
  return response;
}

const getUsersOfYearbooksWhereLoggedInUserBelongs = async (login_user_id : number) : Promise<number[]> => {
  let userIdArr : number[] = [];
  try{
    const sql : string = `
      SELECT
        JSON_ARRAYAGG(yut_2.user_id) as userIdArr
      FROM
        yearbook_user_trans yut_2
      WHERE yut_2.yearbook_id IN(
        SELECT
          yut_1.yearbook_id
        FROM
          yearbook_user_trans yut_1
        WHERE
          yut_1.user_id = ${login_user_id} 
          AND yut_1.removed = 'N'
      )
      AND yut_2.user_id <> ${login_user_id}
    `;
    let response_1 = await excuteQuery(sql,[]);
    let q_res = response_1.q_res;
    if(q_res)
    {
      userIdArr = q_res[0].userIdArr ?? [];
    }
  }
  catch(error:any)
  {

  }
  finally{

  }
  return userIdArr;
}

const getNotificationFormat = async (notifType : string) : Promise<notificationFormatType> => {
  let notification_format : notificationFormatType = { title:'' , message : '' };
  try{
    const sql : string = `
      SELECT 
        nf.title,
        nf.message 
      FROM 
        notifications_format nf 
      WHERE
        nf.removed = 'N'
        AND nf.notification_type = '${notifType}' 
      ORDER
        BY id DESC 
      LIMIT 1;
    `;
    let response_1 = await excuteQuery(sql,[]);
    let q_res = response_1.q_res;
    if(q_res)
    {
      notification_format.title = q_res[0]?.title ?? "";
      notification_format.message = q_res[0]?.message ?? "";
    }
  }
  catch(error:any)
  {

  }
  finally{

  }
  return notification_format;
}

const storeNotification = async (login_user_id : number ,userRecords : any[],title : string,message : string,notification_type : string,status : string) : Promise<any> =>{
  let response : any = {status : 200 , statusText : 'OK'};
  try{
    let removed = "N";
    let values = "";
    let created = getCurrentTimeStamp();
    let modified = created;
    let group_send_id = uuidv4();
    let _title : string = "";
    let _message : string = "";
    userRecords.map( (record,index)=>{
      let user_id = record.id;
      let user_full_name : string = record?.full_name?.trim() ?? "";
      _title = title.replace("${to_user_full_name}",user_full_name);
      _message = message.replace("${to_user_full_name}",user_full_name);
      values = values + `( ${login_user_id} , ${user_id} , '${_title}' , '${_message}' , '${notification_type}' , '${status}' , '${group_send_id}' , '${removed}' , '${created}' , '${modified}' ),`;
    });
    values =  values.replace(/,*\s*$/,"");
    const qry = `
      INSERT INTO notifications (from_user_id , to_user_id , title , message , notification_type , status , group_send_id , removed , created , modified) 
      VALUES ${values}
    `;
  
    const qry_response = await excuteQuery(qry,[]);
    const q_res = qry_response.q_res;

    if(q_res)
    {
      response = {status : 200 , statusText : 'OK'};
    }
    else
    {
      throw new Error("QRY Error");
    }
  }
  catch(error){
    response = {status : 400 , statusText : 'Not OK'};
  }
  return response;
}

const getUsersByUserIdArr = async(userIdArr : number[]) : Promise<any> =>{
  let userRecords : any[] = [];
  try{
    let sql : string = `
      SELECT 
        u1.id,
        CONCAT_WS(" ",u1.first_name,u1.last_name) as full_name
      FROM 
        users u1 
      WHERE 
        u1.id IN(${userIdArr.toString()})
    `;

    let response = await excuteQuery(sql,[]);
    let q_res =  response?.q_res;
    if(q_res)
    {
      userRecords = q_res;
    }
  }catch{

  }
  return userRecords;
}

const getLoggedInUserInfo = async(login_user_id : number) : Promise<any> =>{
  let userRecord : any = {};
  try{
    let sql : string = `
      SELECT 
        u1.id,
        CONCAT_WS(" ",u1.first_name,u1.last_name) as full_name
      FROM 
        users u1 
      WHERE 
        u1.id  = ${login_user_id}
    `;

    let response = await excuteQuery(sql,[]);
    let q_res =  response?.q_res;
    if(q_res)
    {
      userRecord = q_res[0];
    }
  }catch{

  }
  return userRecord;
}

const getUsersIdWhoCommentedOnPost = async(postIid : number) : Promise<number> =>{
  let userId : number = 0;
  try{
    let sql : string = `
      SELECT 
        p.user_id
      FROM 
        posts p
      WHERE 
        p.id  = ${postIid}
    `;

    let response = await excuteQuery(sql,[]);
    let q_res =  response?.q_res;
    if(q_res)
    {
      userId = q_res[0]?.user_id;
    }
  }catch{

  }
  return userId;
}