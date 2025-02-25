import { NextResponse } from 'next/server';
import excuteQuery from '@/app/api/connect_m';
import { getUserAllDetails } from "@/libs/user/getUserAllDetails";
import * as ROLE from "../../../../utils/constant";

export async function GET(request: any) {
  
  try {    
  
    const {
      searchParams
    } = new URL(request.url);
    let user_id = searchParams.get('user_id');
    const yearbook_id = searchParams.get('yearbook_id');
    const institution_id = searchParams.get('institution_id');

    const loggedInUserDetail = await getUserAllDetails(Number(user_id));
    if (!loggedInUserDetail) {      
      return NextResponse.json({error: 'User not found'},{ status: 500 });
    }
    
    /* Fetch the latest notification to get the most recent testimonial */
    let iContentId = 0;
    let notification_type = "";
    let iEncNotificationId = "";

    if(iEncNotificationId)
    {
        const Notification = await excuteQuery(`SELECT notification_type,content_id FROM notification WHERE user_id = ? AND yearbook_id = ? LIMIT 1`,[user_id,yearbook_id]);    
        if(Notification.q_res){
          notification_type = JSON.parse(Notification.q_res[0].notification_type);
          iContentId = JSON.parse(Notification.q_res[0].content_id);
        }
    }
    /* Fetch the latest notification to get the most recent testimonial */
    
    /* Get Received Testimonial List */
		/* Get Sort Order*/
    const sortOrder = await excuteQuery(`SELECT sort_order FROM testimonial_sortorders WHERE user_id = ? AND yearbook_id = ? LIMIT 1`,[user_id,yearbook_id]);    
    let order;
    if(sortOrder.q_res.length>0){
      let sortArray = JSON.parse(sortOrder.q_res[0].sort_order);
      sortArray = sortArray.reverse(); 
  
      const orderBy = sortArray.join(',');
  
      if (orderBy) {
        order = iContentId > 0 
          ? `FIELD(t.id, ${iContentId}) DESC` 
          : `FIELD(t.testimonial_from, ${orderBy}) DESC`;
      } else {
        order = iContentId > 0 
          ? `FIELD(t.id, ${iContentId}) DESC`
          : 'id DESC';
      }
    } else {
      order = iContentId > 0 
        ? `FIELD(t.id, ${iContentId}) DESC` 
        : 'id DESC';
    }
    
    const qry1 = `SELECT
                        t.*,                                                
                        CONCAT(u.first_name,' ',u.last_name) AS testimonial_from_name,
                        u.email  AS testimonial_from_email,
                        u.profile_photo  AS testimonial_from_image,
                        CONCAT(u.sequence_no,'_',u.first_name) AS testimonial_from_image_folder,
                        yut.yearbook_id  AS testimonial_from_yearbook_id,
                        u.can_receive_testimonials  AS can_receive_testimonials,
                        (SELECT p.testimonial_id FROM posts AS p WHERE p.testimonial_id = t.id AND removed='N' limit 1) AS testimonial_id_post,
                        (SELECT p.id FROM posts AS p WHERE p.testimonial_id = t.id AND removed='N' limit 1) AS post_id,
                        (SELECT GROUP_CONCAT(option_value) AS Option_Value FROM question_options 
																			WHERE question_options.id IN( 
																				SELECT
																				  DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(testimonial_answers.answer_id, ',', n.digit+1), ',', -1) val
																				FROM
																				  testimonial_answers
																				  INNER JOIN
																				  (SELECT 0 digit UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) n
																				  ON LENGTH(REPLACE(testimonial_answers.answer_id, ',' , '')) <= LENGTH(testimonial_answers.answer_id)-n.digit
																				  WHERE testimonial_answers.testimonial_id = t.id)) AS received_hashtag
                FROM
                  testimonials t 
                JOIN users u ON u.id = t.testimonial_from
                LEFT JOIN yearbook_user_trans yut ON yut.user_id = u.id
                WHERE testimonial_to = ? 
                  AND t.yearbook_id = ? AND t.removed=0 
                ORDER BY ${order} `;    

    const received_testimonials = await excuteQuery(qry1,[user_id,yearbook_id]);    
    /* Get Received Testimonial List */    

    /* Get Written Testimonial List */
    const qry2 = `SELECT 
                      t.*,                                                
                      CONCAT(user_from.first_name,' ',user_from.last_name) AS testimonial_from_name,
                      user_from.email  AS testimonial_from_email,
                      user_from.profile_photo  AS testimonial_from_image,
                      CONCAT(user_from.sequence_no,'_',user_from.first_name) AS testimonial_from_image_folder,
                      yut.yearbook_id  AS testimonial_from_yearbook_id,
                      user_from.can_receive_testimonials  AS can_receive_testimonials,
                      (SELECT p.testimonial_id FROM posts AS p WHERE p.testimonial_id = t.id AND removed='N' limit 1) AS testimonial_id_post,
                      (SELECT p.id FROM posts AS p WHERE p.testimonial_id = t.id AND removed='N' limit 1) AS post_id,
                      (SELECT GROUP_CONCAT(option_value) AS Option_Value FROM question_options 
																			WHERE question_options.id IN( 
																				SELECT
																				  DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(testimonial_answers.answer_id, ',', n.digit+1), ',', -1) val
																				FROM
																				  testimonial_answers
																				  INNER JOIN
																				  (SELECT 0 digit UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) n
																				  ON LENGTH(REPLACE(testimonial_answers.answer_id, ',' , '')) <= LENGTH(testimonial_answers.answer_id)-n.digit
																				  WHERE testimonial_answers.testimonial_id = t.id)) AS received_hashtag,
                      CONCAT(user_to.first_name,' ',user_to.last_name) AS testimonial_to_name,
                      user_to.email  AS testimonial_to_email,
                      user_to.profile_photo  AS testimonial_to_image,
                      CONCAT(user_to.sequence_no,'_',user_to.first_name) AS testimonial_to_image_folder,
                      (SELECT 
                            COUNT(testimonial_requests.id) 
                            FROM
                            testimonial_requests 
                            WHERE testimonial_requests.request_from = t.testimonial_from
                            AND testimonial_requests.yearbook_id = t.yearbook_id
                            AND testimonial_requests.request_to = t.testimonial_to 
                      LIMIT 1) AS req_sent,
                      (SELECT GROUP_CONCAT(option_value) AS Option_Value FROM question_options 
                                WHERE question_options.id IN( 
                                  SELECT
                                    DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(testimonial_answers.answer_id, ',', n.digit+1), ',', -1) val
                                  FROM
                                    testimonial_answers
                                    INNER JOIN
                                    (SELECT 0 digit UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) n
                                    ON LENGTH(REPLACE(testimonial_answers.answer_id, ',' , '')) <= LENGTH(testimonial_answers.answer_id)-n.digit
                                    WHERE testimonial_answers.testimonial_id = t.id)) AS written_hashtag,
                      (SELECT COUNT(id)  FROM testimonials 
                              WHERE testimonial_from = t.testimonial_to
                              AND testimonial_to = ? 
                              AND yearbook_id = ? 
                              LIMIT 1) AS is_testimonial_written_for_me
                  FROM
                  testimonials t 
                  JOIN users user_to ON user_to.id = t.testimonial_to
                  JOIN users user_from ON user_from.id = t.testimonial_from
                  LEFT JOIN yearbook_user_trans yut ON yut.user_id = user_from.id
                  WHERE testimonial_from = ? 
                  AND t.yearbook_id = ? `;    
    const written_testimonials = await excuteQuery(qry2,[user_id,yearbook_id,user_id,yearbook_id]);    
    /* Get Written Testimonial List */

    /* Get Received Testimonial Request List */
    const qry3 = `SELECT 
                    t.id as request_id,
                    request_to,
                    request_from,                    
                    CONCAT(u.first_name, ' ', u.last_name) AS request_from_name,
                    u.email AS request_from_email,
                    u.profile_photo AS request_from_image,
                    yut.yearbook_id AS yearbook_id,
                    u.can_receive_testimonials AS can_receive_testimonials,
                    CONCAT(u.sequence_no, '_', u.first_name) AS request_from_image_folder 
                  FROM
                  testimonial_requests t 
                  JOIN users u ON u.id = t.request_from    
                  LEFT JOIN yearbook_user_trans yut ON yut.user_id = u.id               
                  WHERE request_to = ? 
                  AND t.yearbook_id = ? AND t.status = 0`;    
    const received_testimonial_requests = await excuteQuery(qry3,[user_id,yearbook_id]);
    /* Get Received Testimonial Request List */

    /* Get Sender  List */    
    const roleIds = [     
      ROLE.STUDENT_ROLE_ID,
      ROLE.COLLEGE_COORDINATOR_STUDENT_ROLE_ID,
      ROLE.COLLEGE_PRINCIPAL_ROLE_ID,
      ROLE.COLLEGE_PROFESSOR_ROLE_ID,
      ROLE.COLLEGE_MENTOR_ROLE_ID,
      ROLE.COLLEGE_COORDINATOR_COLLEGE_ADMIN_STUDENT_ROLE_ID
    ]
    
    let iUserLevel = loggedInUserDetail.level;
    let iTestimonialWriteLevel = loggedInUserDetail.testimonial_write_level || "4";
    // Convert string to a clean, valid number array
    
    let sLevelCondition = "";
    let writeLevelArray = [];
    if (iUserLevel > 0 && iTestimonialWriteLevel > 0) {
      writeLevelArray = iTestimonialWriteLevel
                            .split(',')
                            .map((level:string) => level.trim())  
                            .filter((level:string) => level !== "" && !isNaN(Number(level))); 

      sLevelCondition = `AND u.level IN (${writeLevelArray.join(', ')})`;
    }
   
    
    const qry4 = `SELECT 
                      u.id as user_id,
                      yut.yearbook_id,
                      u.institution_id,
                      u.first_name,
                      u.last_name,
                      u.sequence_no,
                      u.email,
                      u.phone_number,
                      u.profile_photo,
                      u.role_id,
                      u.can_receive_testimonials,  
                      t.message,
                      COALESCE(tr.req_sent, 0) AS req_sent,
                      u.level, 
                      u.testimonial_write_level 
                    FROM
                  users u 
                  LEFT JOIN yearbook_user_trans yut ON yut.user_id = u.id 
                  LEFT JOIN yearbooks y ON y.id = yut.yearbook_id
                  LEFT JOIN (SELECT testimonial_to, message FROM testimonials WHERE testimonial_from = ? GROUP BY testimonial_to) t ON t.testimonial_to = u.id
                  LEFT JOIN (SELECT request_to, COUNT(id) AS req_sent FROM testimonial_requests WHERE request_from = ? AND yearbook_id = ? GROUP BY request_to) tr ON tr.request_to = u.id
              WHERE u.id != ? 
                    AND yut.yearbook_id = ? 
                    AND u.role_id IN (${roleIds.map(() => '?').join(', ')}) 
                    AND y.institution_id = ?
                    AND t.message IS NULL ${sLevelCondition}`;
    
    const values = [user_id, user_id, yearbook_id, user_id, yearbook_id, ...roleIds, institution_id , ...writeLevelArray];
    const sender_list = await excuteQuery(qry4,values);   
    /* Get Sender  List */    
    
    //received_testimonials_count
    const received_testimonials_result = await excuteQuery('SELECT count(id) as received_testimonials_count FROM testimonials WHERE yearbook_id=? AND testimonial_to=?',[yearbook_id,user_id]);   

    // sent_testimonials_count
    const sent_testimonials_result = await excuteQuery('SELECT count(id) as sent_testimonials_count FROM testimonials WHERE yearbook_id=? AND testimonial_from=?',[yearbook_id,user_id]);   

    return NextResponse.json({'received_testimonials':received_testimonials.q_res,
                              'written_testimonials':written_testimonials.q_res,
                              'received_testimonial_requests':received_testimonial_requests.q_res,
                              'sender_list':sender_list.q_res,
                              'received_testimonials_count': received_testimonials_result.q_res[0].received_testimonials_count,
                              'sent_testimonials_count': sent_testimonials_result.q_res[0].sent_testimonials_count});
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Database error',
        details: error.message || 'Unknown error', 
      },
      { status: 500 }
    );
  }
}
