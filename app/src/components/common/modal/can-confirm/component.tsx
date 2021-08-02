import React from 'react'
import { Button, makeStyles, Typography } from "@material-ui/core";
import Section from "components/common/section";

interface ModalCanConfirmProps {
    onCloseConfirmModal: (arg: any) => void | Promise<void>;
    onConfirm: (arg: any) => void | Promise<void>;
    taskId: number
}

const ModalCanConfirm = (props: ModalCanConfirmProps) => {

    const {   onCloseConfirmModal, onConfirm, taskId  } = props;

    const classes = useStyles();



    return (
        <div className={classes.root}>
            <Section>
                <Typography>Принять работу следует только в случае, если вы уверены, что работа выполнена в полном объеме.
                    После подтверждения средства перечисляются исполнителю. Отменить это действие нельзя.
                    Вы действительно хотите подтвердить успешное выполнение заказа №{taskId}?
                </Typography>
            </Section>
            <Section>
                <div className={classes.buttonContainer}>
                    <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={onCloseConfirmModal}
                    >
                        Закрыть
                    </Button>

                    <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={onConfirm}
                    >
                        Подтвердить
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

export default ModalCanConfirm;
