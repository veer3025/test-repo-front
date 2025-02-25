
'use server'

export const getFriendsData = async (user_id :number,yearbook_id :number): Promise<any> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/friends?user_id=${user_id}&yearbook_id=${yearbook_id}`, { method: 'GET' });
        
      if (!response.ok) {
        throw new Error('Failed to fetch Friends  Data');
      }

      return await response.json();       

    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  

