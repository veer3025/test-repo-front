// Next Imports
import { NextResponse } from 'next/server';

import excuteQuery from '@/app/api/connect_m';

export async function POST(req: any) {
  
  var template_list:any = [];
  
  try {
    
    const qry = `SELECT id, name, template_type, is_customize, price, template_json, is_digital 
                 FROM templates 
                 WHERE template_type = 'F' AND is_customize = 'N' AND removed = 'N' ORDER BY id`;
    
    const val:any = [];

    const res = await excuteQuery(qry, val);  

    let row_cnt = (isNaN(res.q_res.length)) ? 0 : res.q_res.length;

    if(res.q_res && row_cnt > 0) {

      template_list = res.q_res;
    }
  } catch ( error:any ) {
    
  }
  
  return NextResponse.json(template_list);
}
