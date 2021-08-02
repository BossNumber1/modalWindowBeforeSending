import React from 'react'
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import {
  Modal as MUIModal,
  ModalProps as MUIModalProps,
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";

import classNames from "classnames";

interface ModalProps {
  children: MUIModalProps["children"];
  className?: string;
  open: MUIModalProps["open"];
  onClose: (...args: any) => void;
}

const Modal = ({ children, className, open, onClose }: ModalProps) => {
  const classes = useStyles();

  return (
    <MUIModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className={classNames(classes.paper, className)}>
        <div className={classes.modalHeader}>
          <div className={classes.iconWrapper} onClick={onClose}>
            <CloseIcon fontSize="large" color="action" />
          </div>
        </div>
        <div className={classes.modalContent}>{children}</div>
      </div>
    </MUIModal>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      outline: 0,
    },
    modalHeader: {
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
    },
    modalContent: {
      width: "100%",
    },
    iconWrapper: {
      cursor: "pointer"
    }
  })
);

export default Modal;
