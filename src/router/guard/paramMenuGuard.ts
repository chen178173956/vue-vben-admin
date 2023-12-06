import type { Router } from 'vue-router';
import { configureDynamicParamsMenu } from '../helper/menuHelper';
import { Menu } from '../types';
import { PermissionModeEnum } from '@/enums/appEnum';
import { useAppStoreWithOut } from '@/store/modules/app';

import { usePermissionStoreWithOut } from '@/store/modules/permission';

export function createParamMenuGuard(router: Router) {
  const permissionStore = usePermissionStoreWithOut();
  router.beforeEach(async (to, _, next) => {
    // filter no name route
    if (!to.name) {
      next();
      return;
    }

    // menu has been built.    根据判断是否重新获取动态路由
    if (!permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }

    let menus: Menu[] = [];
    // 后端模式 BACK
    if (isBackMode()) {
      // 获取 this.setBackMenuList(menuList) 设置的菜单
      menus = permissionStore.getBackMenuList;
    } else if (isRouteMappingMode()) {
      // 前端模式(菜单由路由配置自动生成) ROUTE_MAPPING
      // 获取 this.setFrontMenuList(menuList) 设置的菜单
      menus = permissionStore.getFrontMenuList;
    }
    menus.forEach((item) => configureDynamicParamsMenu(item, to.params));

    next();
  });
}

const getPermissionMode = () => {
  const appStore = useAppStoreWithOut();
  return appStore.getProjectConfig.permissionMode;
};

const isBackMode = () => {
  return getPermissionMode() === PermissionModeEnum.BACK;
};

const isRouteMappingMode = () => {
  return getPermissionMode() === PermissionModeEnum.ROUTE_MAPPING;
};
