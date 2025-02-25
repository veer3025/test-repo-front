import { NextResponse } from 'next/server';
import excuteQuery from '@/app/api/connect_m';

export async function GET(request: any) {
  
  try {    
  
    const {
      searchParams
    } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const yearbook_id = searchParams.get('yearbook_id');
    
    
    /* Get Friends List */		
    const qry = `SELECT 
                      u.*
                    FROM
                  users u 
                  LEFT JOIN yearbook_user_trans yut ON yut.user_id = u.id                   
              WHERE u.id != ? 
                    AND u.yearbook_id_not_in_use = ? `;    
    
    const friends_list = await excuteQuery(qry,[user_id,yearbook_id]);   
    /* Get Friends  List */    
    
    return NextResponse.json(friends_list.q_res);
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
