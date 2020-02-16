import React from 'react';
import { withTranslation } from 'react-i18next';
import './index.less';

function Home({t}) {

  return <div className="home">
    {t('admin.footer')}
  </div>;
}

export default withTranslation()(Home);