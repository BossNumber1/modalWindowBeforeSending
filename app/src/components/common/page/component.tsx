import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import Footer from "./footer";
import Header from "./header";

export enum PageSize {
  Height = 768,
  Width = 1366,
}

interface PageProps {
  children: React.ReactNode;
}

const Page = (props: PageProps) => {
  const { children } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.pageContentContainer}>
        <div className={classes.pageContent}>{children}</div>
      </div>
      <Footer />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    height: "100%",
    width: "100%",
    minWidth: PageSize.Width,
  },
  pageContent: {
    margin: 40,
    width: "100%",
    maxWidth: PageSize.Width,
  },
  pageContentContainer: {
    display: "flex",
    justifyContent: "center",
    flex: "1 0 auto",
  },
}));

export default Page;
