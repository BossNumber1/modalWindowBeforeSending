import classNames from "classnames";
import React from "react";

import { makeStyles } from "@material-ui/core/styles";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section = (props: SectionProps) => {
  const { children, className } = props;

  const classes = useStyles();

  return <div className={classNames(classes.root, className)}>{children}</div>;
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    "& + &": {
      marginTop: 60,
    },
  },
}));

export default Section;
