import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

import { PageSize } from "..";

const Footer = () => {
  const classes = useStyles();

  const preventDefault = (event: any) => event.preventDefault();

  return (
    <div className={classes.root}>
      <div className={classes.footerContentContainer}>
        <Typography>
          <Link href="#" onClick={preventDefault}>
            Link
          </Link>
        </Typography>
      </div>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
    width: "100%",
  },
  footerContentContainer: {
    padding: "24px 24px 100px",
    width: "100%",
    maxWidth: PageSize.Width,
  },
}));

export default Footer;
