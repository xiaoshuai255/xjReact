import React, { Component, Fragment } from 'react';
import { Card, Select, Input, Button, Icon, Table, message } from 'antd';

import { reqGetProduct, reqUpdateProductStatus } from '@api';
import './index.less';
import { withTranslation } from 'react-i18next';


const { Option } = Select;
@withTranslation()
 class Product extends Component {
  state = {
    products: [],
    total: 0,
    pageSize: 3,
    pageNum: 1,
    searchKey: 'productName',
    searchValue: ''
  };
  upDateColumns(){
    this.columns = [
      {
        title: this.props.t('product.commodityName'), //商品名称
        dataIndex: 'name',
      },
      {
        title:this.props.t('product.commodityDescribe'),  //商品描述
        dataIndex: 'desc',
      },
      {
        title: this.props.t('product.price'), //价格
        dataIndex: 'price',
        render: (text) => `￥${text}`
      },
      {
        title:this.props.t('product.state'),  // 列的标题 状态
        render: (product) => {
          const { status, _id } = product;
          return <Fragment>
            <Button type="primary" onClick={this.updateProductStatus(_id, status)}>{status === 1 ? this.props.t('product.putAway') : this.props.t('product.soldOut')}</Button>
            &nbsp;&nbsp;&nbsp;{status === 1 ? this.props.t('product.hasBeenOff') : this.props.t('product.hasBeenOn')}
          </Fragment>
        }
      },
      {
        title: this.props.t('product.operation'),  // 列的标题 操作
        render: (product) => {
          return <Fragment>
            <Button type="link" onClick={this.goProductDetail(product)}>{this.props.t('product.details')}</Button>
            <Button type="link" onClick={this.goUpdateProduct(product)}>{this.props.t('product.amend')}</Button>
          </Fragment>
        }
      }
    ];
  }
  //初始化render的时候不会执行，它会在Component接受到新的状态(Props)时被触发
  componentWillReceiveProps(){
    this.upDateColumns()
  }

  updateProductStatus = (productId, status) => {
    return () => {
      const newStatus = 3 - status;
      reqUpdateProductStatus(productId, newStatus)
        .then(() => {
          this.setState({
            products: this.state.products.map((product) => {
              if (product._id === productId) {
                product.status = newStatus;
              }
              return product;
            })
          })
        })
        .catch((err) => {
          message.error(err);
        })
    }
  };

  goProductDetail = (product) => {
    return () => {
      this.props.history.push('/product/detail', product);
    }
  };

  goUpdateProduct = (product) => {
    return () => {
      this.props.history.push('/product/saveupdate', product);
    }
  };

  searchChange = (key) => {
    return (value) => {
      this.setState({
        [key]: value
      })
    }
  };

  goSaveUpdate = () => {
    this.props.history.push('/product/saveupdate');
  };

  getProduct = (pageNum, pageSize) => {
    reqGetProduct(pageNum, pageSize)
      .then((res) => {
        this.setState({
          products: res.list,
          total: res.total,
          pageSize,
          pageNum,
        })
      })
      .catch((err) => {
        message.error(err);
      })
  };

  componentDidMount() {
    this.getProduct(1, 3);
    this.upDateColumns();
  };

  render() {
    const { products, total, pageSize, pageNum } = this.state;
    const {t} = this.props
    return <Card title={
      <Fragment>
        <Select defaultValue="productName" onChange={this.searchChange('searchKey')}>
          <Option key="1" value="productName">{t('product.accordingToCommodityName')}</Option>
          <Option key="2" value="productDesc">{t('product.accordingToCommodityDescribe')}</Option>
        </Select>
        <Input placeholder={t('product.keyword')} className="product-input" onChange={this.searchChange('searchValue')}/>
        <Button type="primary" onClick={this.search}>{t('product.search')}</Button>
      </Fragment>
    } extra={<Button type="primary" onClick={this.goSaveUpdate}><Icon type="plus"/>{t('product.addCommodity')}</Button>}>
      <Table
        columns={this.columns}
        dataSource={products}
        bordered
        pagination={{
          showQuickJumper: true, // 显示快速跳转
          showSizeChanger: true, // 显示修改每页显示数量
          pageSizeOptions: ['3', '6', '9', '12'], // 修改每页显示数量
          defaultPageSize: 3, // 默认显示数量
          total, // 总数
          onChange: this.getProduct, // 页码发生变化的事件
          onShowSizeChange: this.getProduct, // pageSize 变化的回调
          pageSize,
          current: pageNum
        }}
        rowKey="_id"
      />
    </Card>;
  }
}
export default Product