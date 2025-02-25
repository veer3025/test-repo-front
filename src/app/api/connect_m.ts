import mysql from 'mysql2/promise'

const db_config:any = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  connectionLimit: 10  // Adjust the limit based on your usage
}; 

// Using connection pool for better scalability
const pool = mysql.createPool(db_config);

export default async function excuteQuery(query:any, values:any) {
  let q_result:any = false;
  let q_error:any = false;

  try {
    // Using pool to get a connection and execute the query
    const [rows] = await pool.execute(query, values);
    
    q_result = rows;

    //console.log(`Pool : ${JSON.stringify(pool.config)}`);
  } 
  catch (error:any) {
    q_error = error.message ?? 'Unknown error';
  }
  
  return { q_res: q_result, q_err: q_error };
}
