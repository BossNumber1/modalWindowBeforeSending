import moment from "moment-timezone";
import {
  useCallback,

  // useEffect, useState
} from "react";

// const useSomethingToGetuser = () => {
//   const [user, setUser] = useState(null);

//   // const token = useSomethingToGetToken();

//   // useEffect(() => {
//   // (async () => {
//   // const result = await getUser(token);
//   // setUser(result.user);
//   // })();
//   // }, [token]);

//   return user;
// };

const useDateFormatter = () => {
  // const user = useSomethingToGetuser();

  moment.tz.add(
    "Asia/Tomsk|LMT +06 +07 +08|-5D.P -60 -70 -80|0123232323232323232323212323232323232323232323212121212121212121212|-21NhD.P pxzD.P 23CL0 1db0 1cN0 1db0 1cN0 1db0 1dd0 1cO0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 2pB0 IM0 rX0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 co0 1bB0 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 8Hz0 3Qp0|10e5"
  );

  return useCallback(
    (rawDate?: string) => {
      if (!rawDate) {
        return;
      }

      if (rawDate.includes("+")) {
        return moment(rawDate.split("+")[0]).format("DD.MM.YYYY HH:MM");
      }

      return moment(rawDate).tz("Asia/Tomsk").format("DD.MM.YYYY HH:MM");
    },
    // [user]
    []
  );
};

export default useDateFormatter;
