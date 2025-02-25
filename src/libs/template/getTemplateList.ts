export const getTemplateList = async (param:any = {}) => {

  const cdt = new Date();

  const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},
                body   : JSON.stringify({data_id : cdt.toISOString(), ...param})};

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/get-template-list`, opt);
  
  if (!res) {
    
    const error:any = [];

    return error.json();
  }

  return res.json();
};