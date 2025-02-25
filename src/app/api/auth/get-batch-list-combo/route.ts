// Next Imports
import { NextResponse } from 'next/server';

import excuteQuery from '@/app/api/connect_m';

export async function POST(req: any) {
  
  var batch_list:any = [];
  
  try {
    
    const qry = `SELECT id, name FROM batch_masters WHERE removed = 'N' ORDER BY name`;
    
    const val:any = [];

    const res = await excuteQuery(qry, val);  

    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;

    if(res.q_res && row_cnt > 0) {

      batch_list = res.q_res;
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(batch_list);
}
