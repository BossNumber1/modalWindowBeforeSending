import React from 'react'

import DateFnsUtils from "@date-io/date-fns";

import { Button, makeStyles, Typography } from "@material-ui/core";

import {
  //   DatePicker,
  //   TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import { useKeycloak } from "@react-keycloak/web";

import format from "date-fns/format";
import ruLocale from "date-fns/locale/ru";

import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import agentApi from "api/grpc/agent";
import { CommonReturnMessagePrReturn } from "api/grpc/common";

import Section from "components/common/section";

import { formatDateToSend } from "lib/helper";

class RuLocalizedUtils extends DateFnsUtils {
  getCalendarHeaderText(date: Date) {
    return format(date, "LLLL", { locale: this.locale });
  }

  getDatePickerHeaderText(date: Date) {
    return format(date, "dd MMMM", { locale: this.locale });
  }
}

interface AgentTaskViewMatchParams {
  taskId: string;
}

interface ModalSetTimeProps {
  onSubmit: (arg: CommonReturnMessagePrReturn) => void | Promise<void>;
}

const ModalSetTime = (props: ModalSetTimeProps) => {
  const { onSubmit: handleSubmit } = props;

  const [date, setDate] = useState<Date | null>(null);

  const params = useParams<AgentTaskViewMatchParams>();

  const taskId = Number(params.taskId);

  const classes = useStyles();

  const { keycloak } = useKeycloak();

  const token = keycloak.token;

  const onSubmit = useCallback(() => {
    if (!(token && taskId && date)) {
      return;
    }

    const formattedDate = formatDateToSend(date);

    agentApi.setScheduledTaskTime({
      token,
      taskId,
      time: formattedDate,
    }).then((res) => {
      handleSubmit(res);
    });
  }, [token, taskId, date, handleSubmit]);

  return (
    <div className={classes.root}>
      <Section className={classes.section}>
        <Typography>Выберите дату и время</Typography>
      </Section>
      <Section className={classes.section}>
        <MuiPickersUtilsProvider utils={RuLocalizedUtils} locale={ruLocale}>
          <DateTimePicker
            ampm={false}
            value={date}
            onChange={(newDate) => {
              setDate(newDate);
            }}
            format={"dd.MM.yyyy HH:mm"}
            cancelLabel={"отмена"}
            inputProps={{
              placeholder: "Выберите дату и время",
            }}
            // variant="static"
          />
        </MuiPickersUtilsProvider>
      </Section>
      <Section className={classes.buttonContainer}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={!date}
        >
          Отправить
        </Button>
      </Section>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: 550,
    height: 250,
  },
  section: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    "& > :not(:last-child)": {
      marginRight: 20,
    },
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));

export default ModalSetTime;
