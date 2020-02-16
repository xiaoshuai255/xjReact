import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import { withTranslation } from 'react-i18next';

const { Item } = Form;

@Form.create()
@withTranslation()
class UpdateCategoryNameForm extends Component {
  static propTypes = {
    category: PropTypes.object.isRequired
  };

  validator = (rule, value, callback) => {
    if (!value) {
      callback(this.props.t('category.blankName'));
    } else if (value === this.props.category.name) {
      callback(this.props.t('category.sameName'));
    } else {
      callback();
    }
  };

  render() {
    const { category : { name } , form : { getFieldDecorator } } = this.props;

    return <Form >
      <Item>
        {
          getFieldDecorator(
            'categoryName',
            {
              initialValue: name,
              rules: [
                { validator: this.validator }
              ]
            }
          )(
            <Input />
          )
        }
      </Item>
    </Form>;
  }
}

export default UpdateCategoryNameForm;