<!-- ProjectAddAuthorModal.vue -->
<template>
  <b-modal id="projectAddAuthorModal" title="Add Author" hide-footer>
    <b-form @submit.prevent="handleSubmit">
      <b-form-group label="Name" label-for="nameInput">
        <b-form-input id="nameInput" v-model="name" placeholder="Enter name" />
      </b-form-group>

      <b-form-group label="Email" label-for="emailInput">
        <b-form-input id="emailInput" v-model="email" type="email" placeholder="Enter email" />
      </b-form-group>

      <b-form-group label="Phone" label-for="phoneInput">
        <b-form-input id="phoneInput" v-model="phone" type="tel" placeholder="Enter phone number" />
      </b-form-group>

      <div class="d-flex justify-content-end">
        <b-button variant="secondary" @click="$bvModal.hide('projectAddAuthorModal')">
          Close
        </b-button>
        <b-button :disabled="!isFormValid" variant="primary" type="submit" class="ml-2">
          Submit
        </b-button>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  name: "ProjectAddAuthorModal",
  data() {
    return {
      name: "",
      email: "",
      phone: "",
    };
  },
  computed: {
    isFormValid() {
      return this.name && this.email && this.phone;
    },
  },
  methods: {
    handleSubmit() {
      const newAuthor = {
        name: this.name,
        email: this.email,
        phone: this.phone,
      };
      this.$emit("author-added", newAuthor);
      this.name = "";
      this.email = "";  
      this.phone = "";
      this.$bvModal.hide("projectAddAuthorModal");
    }
  }
};
</script>
