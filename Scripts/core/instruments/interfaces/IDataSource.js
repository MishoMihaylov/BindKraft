


/*INTERFACE*/
function IDataSourceImpl() { }
IDataSourceImpl.Interface("IDataSourceImpl");
IDataSourceImpl.Interface.dataSourceCount = function () {
    throw "dataSourceCount is not implemented.";
};
IDataSourceImpl.Interface.dataSourceGet = function (cond, offset, limit) {
    throw "dataSourceGet is not implemented.";
}
IDataSourceImpl.Interface.dataSourceSet = function (data) {
    throw "dataSourceSet is not implemented.";
}