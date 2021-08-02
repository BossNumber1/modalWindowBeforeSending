import React from 'react'
import { makeStyles } from "@material-ui/core";

import classNames from "classnames";

interface CenteringContainerProps {
  children: React.ReactNode
  className?: string
}

const CenteringContainer = (props: CenteringContainerProps) => {
  const { children, className } = props;

  const classes = useStyles();

  return <div className={classNames(classes.root, className)}>{children}</div>;
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
}));

export default CenteringContainer;
