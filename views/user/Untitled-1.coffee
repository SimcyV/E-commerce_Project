
                <div class="col-7 bg-light" id="profile" style="display: block;">
                    <div class="d-flex shadow-sm rounded-3 m-5 bg-white">
                        <div class="mx-5 my-3 d-flex align-items-center">
                            <img style="height: 150px; width: auto;"
                                src="https://static-00.iconduck.com/assets.00/profile-circle-icon-512x512-zxne30hp.png"
                                alt="">
                        </div>
                        <div class="mx-5 my-3 d-flex align-items-center">
                            <div>
                                <h4 class="my-3 fw-bold">
                                    <%= newuser.name %>
                                </h4>
                                <p class="">
                                    <%= newuser.email%>
                                </p>

                                <% if (newuser.address.length>0) { %>
                                    <p class="mb-1">
                                        <%= newuser.address[0].addressLane %>
                                    </p>
                                    <p class="mb-1">
                                        <%= newuser.address[0].city %>, <%= newuser.address[0].state %> - <%=
                                                    newuser.address[0].pincode %>
                                    </p>

                                    <p class="mb-3">
                                        <%= newuser.address[0].mobile %>
                                    </p>

                                    <% } %>
                            </div>
                        </div>

                    </div>
                </div>

                