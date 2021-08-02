import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";
import Section from "components/common/section";

interface ModalSuccessUploadProps {
    onClose: (arg: any) => void | Promise<void>;
}

const ModalSuccessUpload = (props: ModalSuccessUploadProps) => {

    const {   onClose } = props;

    const classes = useStyles();



    return (
        <div className={classes.root}>
            <Section>
                <Typography>Анкета принята и отправлена на проверку модератору. После проверки модератором Вы получите уведомление
                </Typography>
            </Section>
            <Section>
                <div className={classes.buttonContainer}>
                    <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={onClose}
                    >
                        Закрыть
                    </Button>
                </div>
            </Section>
        </div>
    );
};

const useStyles = makeStyles(() => ({
    root: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: 350,
        height: 250,
    },
    buttonContainer: {
        display: "flex",
        "& > :not(:last-child)": {
            marginRight: 20,
        },
    },
}));

export default ModalSuccessUpload;
