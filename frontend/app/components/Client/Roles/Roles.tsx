import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import { Loader, IconButton, Popup, NoContent, SlideModal } from 'UI'
import { connect } from 'react-redux'
import stl from './roles.css'
import RoleForm from './components/RoleForm'
import { init, edit, fetchList, remove as deleteRole } from 'Duck/roles';
import RoleItem from './components/RoleItem'
import { confirm } from 'UI/Confirmation';

interface Props {
  loading: boolean
  init: (role?: any) => void,
  edit: (role: any) => void,
  instance: any,
  roles: any[],
  deleteRole: (id: any) => void,
  fetchList: () => Promise<void>,
  account: any,
  permissionsMap: any
}

function Roles(props: Props) {
  const { loading, instance, roles, init, edit, deleteRole, account, permissionsMap } = props
  const [showModal, setShowmModal] = useState(false)
  const isAdmin = account.admin || account.superAdmin;

  console.log('permissionsMap', permissionsMap)


  useEffect(() => {
    props.fetchList()
  }, [])

  const closeModal = () => {
    setShowmModal(false)
    setTimeout(() => {
      init()
    }, 100)
  }

  const editHandler = role => {
    init(role)
    setShowmModal(true)
  }

  const deleteHandler = async (role) => {
    if (await confirm({
      header: 'Roles',
      confirmation: `Are you sure you want to remove this role?`
    })) {
      deleteRole(role.roleId)
    }
  }

  return (
    <React.Fragment>
      <Loader loading={ loading }>
        <SlideModal
          title={ instance.exists() ? "Edit Role" : "Add Role" }
          size="small"
          isDisplayed={showModal }
          content={ showModal && <RoleForm closeModal={closeModal}/> }
          onClose={ closeModal }
        />
        <div className={ stl.wrapper }>
          <div className={ cn(stl.tabHeader, 'flex items-center') }>
            <div className="flex items-center mr-auto">
              <h3 className={ cn(stl.tabTitle, "text-2xl") }>Manage Roles and Permissions</h3>
              <Popup
                trigger={
                  <div>
                    <IconButton
                      id="add-button"
                      circle
                      icon="plus"
                      outline
                      disabled={ !isAdmin }
                      onClick={ () => setShowmModal(true) }
                    />
                  </div>
                }
                disabled={ isAdmin }
                size="tiny"
                inverted
                position="top left"
              />
            </div>              
          </div>

          <NoContent
            title="No roles are available."
            size="small"
            show={ false }
            icon
          >
            <div className={''}>
              {roles.map(role => (
                <RoleItem
                  role={role}
                  permissions={permissionsMap}
                  editHandler={editHandler}
                  deleteHandler={deleteHandler}
                />
              ))}
            </div>
          </NoContent>
        </div>
      </Loader>
    </React.Fragment>
  )
}

export default connect(state => {
  const permissions = state.getIn(['roles', 'permissions'])
  const permissionsMap = {}
  permissions.forEach(p => {
    permissionsMap[p.value] = p.name
  });
  return {
    instance: state.getIn(['roles', 'instance']) || null,
    permissionsMap: permissionsMap,
    roles: state.getIn(['roles', 'list']),
    loading: state.getIn(['roles', 'fetchRequest', 'loading']),
    account: state.getIn([ 'user', 'account' ])
  }
}, { init, edit, fetchList, deleteRole })(Roles)