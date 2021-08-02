import React from 'react'
import { ChangeModalType } from "components/common/modal/change-phone";
import ModalChangePhone from "components/common/modal/change-phone/component";
import Page from "components/common/page/component";
import DocumentTitle from "react-document-title";
import { useHistory } from "react-router-dom";

function _generateHeader(type: ChangeModalType): string {
  switch (type) {
    case ChangeModalType.Email:
      return "Подтверждение Email";

    case ChangeModalType.Phone:
      return "Подтверждение телефона";
  }
}
interface ChangePhoneEmailProps {
  type: ChangeModalType;
}

const ChangePhoneEmailPage = (props: ChangePhoneEmailProps) => {
  const { type } = props;

  const history = useHistory();

  const onSubmit = () => {
    history.push("/");
  };

  return (
    <DocumentTitle title={_generateHeader(type)}>
      <Page>
        <ModalChangePhone onSubmit={onSubmit} modalType={type} />
      </Page>
    </DocumentTitle>
  );
};

export default ChangePhoneEmailPage;
