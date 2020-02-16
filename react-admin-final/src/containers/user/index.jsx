import React, { Component } from 'react';
import { Card, Button, Table, Modal, message } from 'antd';
import dayjs from "dayjs";

import { reqGetUser, reqAddUser, reqUpdateUser, reqGetRole, reqDeleteUser } from '@api';

import AddUserForm from './add-user-form';
import UpdateUserForm from './update-user-form';
import { withTranslation } from 'react-i18next';

@withTranslation()


class User extends Component {
  state = {
    users: [], //用户数组
    roles: [],
    isShowAddUserModal: false,
    isShowUpdateUserModal: false,
    username: '',
  };

  addUserFormRef = React.createRef();
  updateUserFormRef = React.createRef();
  updateColumns() {
    this.columns = [
      {
        title: this.props.t('user.name'), //用户名
        dataIndex: 'username',
      },
      {
        title: this.props.t('user.email'), //邮箱
        dataIndex: 'email',
      },
      {
        title: this.props.t('user.phone'), //电话
        dataIndex: 'phone',
      },
      {
        title: this.props.t('user.createTime'), //注册时间
        dataIndex: 'createTime',
        render: time => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: this.props.t('user.roleId'), //所属角色
        dataIndex: 'roleId',
        render: (id) => {
          const role = this.state.roles.find((role) => role._id === id);
          return role ? role.name : '';
        }
      },
      {
        title: this.props.t('user.operation'), //操作
        dataIndex: 'operation',
        render: username => {
          return <div>
            <Button type="link" onClick={this.showUpdateModal(username)}>{this.props.t('user.changePassword')}</Button>
            <Button type="link" onClick={this.showDeleteUserModal(username)}>{this.props.t('user.delete')}</Button>
          </div>
        }
      }
    ];
  }
  
  componentWillReceiveProps(){
    this.updateColumns()
  }
  showDeleteUserModal = (username) => {
    return () => {
      Modal.confirm({
        title: `确认要删除${username}这个账号吗`,
        okText: this.props.t('admin.okText'),
        cancelText: this.props.t('admin.cancelText'),
        onOk: () => {
          reqDeleteUser(username)
            .then(() => {
              message.success(this.props.t('user.deleteSuccess'));
            })
            .catch((err) => {
              message.error(err);
            })
        }
      })
    }
  }

  showUpdateModal = (username) => {
    return () => {
      this.setState({
        username,
        isShowUpdateUserModal: true
      })
    }
  };

  componentDidMount() {
    reqGetUser()
      .then((res) => {
        message.success(this.props.t('user.getUserListSuccess'), 3);
        this.setState({
          users: res
        })
      })
      .catch(() => {
        message.error(this.props.t('user.getUserListError'), 3);
      });

    reqGetRole()
      .then((res) => {
        message.success(this.props.t('user.getRoleListSuccess'), 3);
        this.setState({
          roles: res
        })
      })
      .catch(() => {
        message.error(this.props.t('user.getRoleListError'), 3);
      })
      this.updateColumns()
  }

  //创建用户的回调函数
  addUser = () => {
    this.addUserFormRef.current.validateFields((err, values) => {
      if (!err) {
        const { username, password, phone, email, roleId } = values;
        // 发送请求
        reqAddUser({ username, password, phone, email, roleId })
          .then((res) => {
            message.success(this.props.t('user.addSuccess'), 3);
            this.setState({
              users: [...this.state.users, res],
            })
          })
          .catch(() => {
            message.error(this.props.t('user.addError'), 3);
          })
          .finally(() => {
            this.setState({
              isShowAddUserModal: false
            });
            this.addUserFormRef.current.resetFields();
          })
      }
    })

  };

  updateUser = () => {
    const form = this.updateUserFormRef.current;

    form.validateFields((err, values) => {
      if (!err) {
        const { password, rePassword } = values;

        if (password !== rePassword) {
          return form.setFields({
            rePassword: {
              value: rePassword,
              errors: [new Error(this.props.t('user.pwdDifferent'))],
            },
          });
        }
        // 发送请求
        reqUpdateUser(this.state.username, password)
          .then((res) => {
            message.success(this.props.t('user.upDatePwdSuccess'));
          })
          .catch(() => {
            message.error(this.props.t('user.upDatePwdError'));
          })
          .finally(() => {
            this.setState({
              isShowUpdateUserModal: false
            });
            form.resetFields();
          })
      }
    })

  };

  switchModal = (key, value) => {
    return () => {
      this.setState({
        [key]: value
      })
    }
  };

  render() {
    const { users, roles, isShowAddUserModal, isShowUpdateUserModal } = this.state;

    return (
      <Card
        title={
          <Button type='primary' onClick={this.switchModal('isShowAddUserModal', true)}>{this.props.t('user.createUser')}</Button>
        }
      >
        <Table
          columns={this.columns}
          dataSource={users}
          bordered
          rowKey='_id'
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '15', '20'],
            showQuickJumper: true,
          }}
        />
        <Modal
          title={this.props.t('user.createUser')}
          visible={isShowAddUserModal}
          onOk={this.addUser}
          onCancel={this.switchModal('isShowAddUserModal', false)}
          okText={this.props.t('admin.okText')}
          cancelText={this.props.t('admin.cancelText')}
        >
          <AddUserForm ref={this.addUserFormRef} roles={roles} />
        </Modal>

        <Modal
          title={this.props.t('user.changePassword')}
          visible={isShowUpdateUserModal}
          onOk={this.updateUser}
          onCancel={this.switchModal('isShowUpdateUserModal', false)}
          okText={this.props.t('admin.okText')}
          cancelText={this.props.t('admin.cancelText')}
        >
          <UpdateUserForm ref={this.updateUserFormRef} />
        </Modal>

      </Card>
    )
  }
}
export default User