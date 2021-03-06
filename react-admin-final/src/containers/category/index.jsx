import React, { Component, Fragment } from 'react';
import { Card, Button, Icon, Table, Modal } from 'antd';

import { connect } from 'react-redux';
import { addCategoryAsync, getCategoryAsync, updateCategoryNameAsync, deleteCategoryAsync } from '@actions/category';

import AddCategoryForm from './add-category-form';
import UpdateCategoryNameForm from './update-category-name-form';
import { withTranslation } from 'react-i18next';

@connect(
  (state) => ({categories: state.categories}),
  { addCategoryAsync, getCategoryAsync, updateCategoryNameAsync, deleteCategoryAsync }
)
@withTranslation()
class Category extends Component {
  state = {
    isShowAddCategory: false,
    isShowUpdateCategoryName: false,
    category: {}
  };

  addCategoryFormRef = React.createRef();
  updateCategoryNameFormRef = React.createRef();

  columns = [
    {
      title: this.props.t('category.name'),//品类名称
      dataIndex: 'name',
      // render: text => <a>{text}</a>, // 默认是纯文本，如果要加上指定标签，就得render方法
    },
    {
      title: this.props.t('category.operation'), // 列的标题
      className: 'column-operation',  // 列的类名
      // dataIndex: '_id', // 要显示数据的属性名相关
      render: (category) => {
        /*
          如果有dataIndex，根据它的值来获取要渲染data的对应属性值，放在render方法作为参数传入
          如果没有dataIndex，就会将整个data数据，放在render方法作为参数传入
         */
        return <Fragment>
          <Button type="link" onClick={this.showUpdateCategoryNameModal(category)}>{this.props.t('category.amendSort')}</Button>
          <Button type="link" onClick={this.showDeleteCategoryModal(category)}>{this.props.t('category.deleteSort')}</Button>
        </Fragment>
      }
    }
  ];

  showDeleteCategoryModal = (category) => {
    
    return () => {
      Modal.confirm({
        title: this.props.t('category.title'),
        okText:this.props.t('admin.okText'),
        cancelText:this.props.t('admin.cancelText'),
        onOk: () => {
          this.props.deleteCategoryAsync(category._id);
        },
        /*onCancel: () => {
          console.log('Cancel');
        },*/
      })
    }
  };

  showUpdateCategoryNameModal = (category) => {
    return () => {
      this.setState({
        category,
        isShowUpdateCategoryName: true
      })
    }
  };

  hideModal = (key) => {
    return () => {
      this.setState({
        [key]: false
      })
    }
  };

  showAddCategoryModal = () => {
    this.setState({
      isShowAddCategory: true
    })
  };

  addCategory = () => {
    const form = this.addCategoryFormRef.current;
    form.validateFields((err, values) => {
      if (!err) {
        const { categoryName } = values;
        // 添加分类
        this.props.addCategoryAsync(categoryName);
        // 隐藏对话框
        this.setState({
          isShowAddCategory: false
        });
        // 重置表单项
        form.resetFields();
      }
    })
  };

  updateCategoryName = () => {
    const form = this.updateCategoryNameFormRef.current;
    form.validateFields((err, values) => {
      if (!err) {
        const { _id: categoryId } = this.state.category;
        const { categoryName } = values;
        this.props.updateCategoryNameAsync(categoryId, categoryName);
        this.setState({
          isShowUpdateCategoryName: false
        });
        form.resetFields();
      }
    })
  };

  componentDidMount() {
    // 请求分类数据
    if (!this.props.categories.length) {
      this.props.getCategoryAsync();
    }
  }

  render() {
    const { isShowAddCategory, isShowUpdateCategoryName, category } = this.state;
    const { categories,t } = this.props;

    return <Card
      title={t('category.sortList')}
      extra={<Button type="primary" onClick={this.showAddCategoryModal}><Icon type="plus"/>{t('category.sortList')}</Button>}
    >
      <Table
        columns={this.columns}
        dataSource={categories}
        bordered
        pagination={{
          showQuickJumper: true, // 显示快速跳转
          showSizeChanger: true, // 显示修改每页显示数量
          pageSizeOptions: ['3', '6', '9', '12'], // 修改每页显示数量
          defaultPageSize: 3 // 默认显示数量
        }}
        rowKey="_id"
      />

      <Modal
      //添加
        title={t('category.addSort')}
        visible={isShowAddCategory}
        onOk={this.addCategory}
        onCancel={this.hideModal('isShowAddCategory')}
        okText={this.props.t('admin.okText')}
        cancelText={this.props.t('admin.cancelText')}
        width={300}
      >
        <AddCategoryForm ref={this.addCategoryFormRef}/>
      </Modal>

      <Modal
      //修改
        title={t('category.amendSort')}
        visible={isShowUpdateCategoryName}
        onOk={this.updateCategoryName}
        onCancel={this.hideModal('isShowUpdateCategoryName')}
        okText={this.props.t('admin.okText')}
        cancelText={this.props.t('admin.cancelText')}
        width={300}
      >
        <UpdateCategoryNameForm category={category} ref={this.updateCategoryNameFormRef}/>
      </Modal>

    </Card>;
  }
}

export default Category;