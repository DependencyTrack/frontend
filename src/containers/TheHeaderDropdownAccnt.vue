<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <div class="c-avatar">
          <i class="fa fa-user-circle-o" style="font-size:1.6em;"></i>
        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader>
      {{ $t('message.connected_as') }} <strong>{{ user }}</strong>
    </CDropdownHeader>
    <CDropdownItem v-if="canUpdateProfile()" v-b-modal.profileEditModal>
      <i class="fa fa-user text-primary" style="margin-right: 1rem;" /> {{ $t('message.profile_update') }}
    </CDropdownItem>
    <profile-edit-modal />
    <CDropdownItem v-if="canChangePassword()" to="/change-password">
      <i class="fa fa-key text-primary" style="margin-right: 1rem;" /> {{ $t('message.change_password') }}
    </CDropdownItem>
    <CDropdownDivider v-if="canUpdateProfile() || canChangePassword()" />
    <CDropdownItem @click="logout">
      <i class="fa fa-sign-out text-primary" style="margin-right: 1rem;" /> {{ $t('message.logout') }}
    </CDropdownItem>
  </CDropdown>
</template>

<script>
import { CDropdown, CDropdownHeader, CDropdownItem, CDropdownDivider } from '@coreui/vue';
import ProfileEditModal from "../views/components/ProfileEditModal";
import globalVarsMixin from "../mixins/globalVarsMixin";
import EventBus from '../shared/eventbus';
import { decodeToken, getToken } from '../shared/permissions';

export default {
  name: 'TheHeaderDropdownAccnt',
  mixins: [globalVarsMixin],
  components: {
    CDropdown,
    CDropdownHeader,
    CDropdownItem,
    CDropdownDivider,
    ProfileEditModal,
  },
  data: () => {
    return {
      identityProvider: decodeToken(getToken()).idp
    }
  },
  computed: {
    user() {
      return this.currentUser.fullname || this.currentUser.username
    }
  },
  methods: {
    logout: function () {
      // Instructs all tabs (via localStorage event) that the session is being invalidated
      localStorage.setItem("sessionInvalidate", Date.now().toLocaleString());
      localStorage.removeItem("sessionInvalidate");
      // Removes the token from session storage and reload
      EventBus.$emit('authenticated', null);
      this.$router.replace({ name: "Login" });
    },
    canChangePassword: function() {
      return this.identityProvider == "LOCAL";
    },
    canUpdateProfile: function() {
      return this.identityProvider == "LOCAL";
    }
  }
}
</script>

<style>
.c-header .navbar-nav .dropdown-menu-right {
  right: inherit;
}
</style>
