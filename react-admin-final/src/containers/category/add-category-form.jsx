import React, { Component } from 'react';
import { Form, Input } from 'antd';
import { withTranslation } from 'react-i18next';

const { Item } = Form;

@Form.create()
@withTranslation()
class AddCategoryForm extends Component {

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { t } = this.props
    return <Form>
      <Item label={t('category.name')} >
        {
          getFieldDecorator(
            'categoryName',
            {
              rules: [
                { required: true, message: t('category.message') }
              ]
            }
          )(
            <Input placeholder={t('category.message')} />
          )
        }
      </Item>
    </Form>;
  }
}
// 为了给AddCategoryForm传递一个form属性
export default AddCategoryForm;