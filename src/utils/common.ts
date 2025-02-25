export const isYearbookExpired = (yearbookLastEditDate: string | null | undefined): boolean => {
    if (!yearbookLastEditDate) return false; // If date is missing, assume not expired
  
    const today = new Date(); // Get today's date
    const lastEditDate = new Date(yearbookLastEditDate); // Convert input string to Date object
  
    return lastEditDate < today; // Returns true if date is in the past
};


export const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
  
    for (let { label, seconds: sec } of intervals) {
      const value = Math.floor(seconds / sec);
      if (value >= 1) return rtf.format(-value, label as Intl.RelativeTimeFormatUnit);
    }
  
    return "Just now";
  };

  