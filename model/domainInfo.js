import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const domainInfoSchema = new Schema({
    name: String,
})

const DomainInfo = mongoose.model('DomainInfo', domainInfoSchema);

export default DomainInfo